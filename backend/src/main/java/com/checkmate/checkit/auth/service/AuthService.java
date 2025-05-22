package com.checkmate.checkit.auth.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import com.checkmate.checkit.auth.dto.response.AuthResponse;
import com.checkmate.checkit.auth.dto.response.JiraProjectListResponse;
import com.checkmate.checkit.auth.entity.OAuthToken;
import com.checkmate.checkit.auth.repository.OAuthTokenRepository;
import com.checkmate.checkit.functional.dto.response.FunctionalSpecResponse;
import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.common.enums.AuthProvider;
import com.checkmate.checkit.global.config.JwtTokenProvider;
import com.checkmate.checkit.global.config.properties.OAuthProperties;
import com.checkmate.checkit.global.exception.CommonException;
import com.checkmate.checkit.project.dto.response.ProjectMemberWithEmailResponse;
import com.checkmate.checkit.project.entity.JiraProjectEntity;
import com.checkmate.checkit.user.dto.response.LoginResponse;
import com.checkmate.checkit.user.entity.User;
import com.checkmate.checkit.user.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

	private final OAuthProperties oauthProperties;
	private final UserRepository userRepository;
	private final OAuthTokenRepository oAuthTokenRepository;
	private final JwtTokenProvider jwtTokenProvider;
	private final WebClient webClient;
	private final RedisTemplate<String, Object> redisTemplate;

	/**
	 * GitHub 로그인 URL 생성
	 */
	public String getGithubLoginUrl() {
		OAuthProperties.Provider github = oauthProperties.getProvider("github");
		if (github == null) {
			throw new CommonException(ErrorCode.OAuth2AuthenticationRedirectFilter);
		}

		return github.getAuthorizationUri() + "?client_id=" + github.getClientId() + "&redirect_uri="
			+ URLEncoder.encode(github.getRedirectUri(), StandardCharsets.UTF_8) + "&scope=" + github.getScope();
	}

	/**
	 * GitLab 로그인 URL 생성
	 */
	public String getGitlabLoginUrl() {
		OAuthProperties.Provider gitlab = oauthProperties.getProvider("gitlab");
		if (gitlab == null) {
			throw new CommonException(ErrorCode.OAuth2AuthenticationRedirectFilter);
		}

		return gitlab.getAuthorizationUri() + "?client_id=" + gitlab.getClientId() + "&redirect_uri="
			+ URLEncoder.encode(gitlab.getRedirectUri(), StandardCharsets.UTF_8) + "&response_type=code" + "&scope="
			+ gitlab.getScope();
	}

	/**
	 * GitHub 로그인 콜백 처리
	 * @param code : GitHub에서 받은 인증 코드
	 * @param response : HttpServletResponse
	 * @return AuthResponse : JWT 토큰을 포함한 응답
	 */
	@Transactional
	public AuthResponse processGithubCallback(String code, HttpServletResponse response) {

		// GitHub에서 받은 인증 코드로 액세스 토큰 요청
		String accessToken = getAccessTokenFromGithub(code);

		// 액세스 토큰으로 사용자 정보 요청
		Map<String, Object> userInfo = getUserInfoFromGithub(accessToken);

		// 사용자 정보로 DB에 사용자 등록 및 OAuthToken 저장
		User user = processUserLogin(userInfo.get("id").toString(), (String)userInfo.get("login"),
			userInfo.get("name").toString(), getEmailFromGithub(userInfo, accessToken), AuthProvider.GITHUB,
			accessToken, response);

		// Access 토큰 생성
		String jwtAccessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getUserName(),
			user.getNickname());

		return new AuthResponse(jwtAccessToken, new LoginResponse(user));
	}

	/**
	 * GitLab 로그인 콜백 처리
	 * @param code : GitLab에서 받은 인증 코드
	 * @param response : HttpServletResponse
	 * @return AuthResponse : JWT 토큰을 포함한 응답
	 */
	@Transactional
	public AuthResponse processGitlabCallback(String code, HttpServletResponse response) {

		// GitLab에서 받은 인증 코드로 액세스 토큰 요청
		String accessToken = getAccessTokenFromGitlab(code);

		// GitLab API로 사용자 정보 요청
		Map<String, Object> userInfo = getUserInfoFromGitlab(accessToken);

		// 필수 정보 확인
		String externalId = String.valueOf(userInfo.get("id"));
		String username = (String)userInfo.get("username");
		String nickname = (String)userInfo.get("name");
		String email = (String)userInfo.get("email");

		if (email == null || email.isEmpty()) {
			log.error("GitLab 사용자의 이메일을 찾을 수 없습니다.");
			throw new CommonException(ErrorCode.OAuth2AuthenticationProcessingFilter);
		}

		// 사용자 정보로 DB에 사용자 등록 및 OAuthToken 저장
		User user = processUserLogin(externalId, username, nickname, email, AuthProvider.GITLAB, accessToken, response);

		// Access 토큰 생성
		String jwtAccessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getUserName(),
			user.getNickname());

		log.info("로그인 성공: 사용자 ID = {}, 사용자 이름 = {}", user.getId(), user.getUserName());

		return new AuthResponse(jwtAccessToken, new LoginResponse(user));
	}

	/**
	 * 사용자 로그인 처리 공통 로직
	 * @param externalId : 외부 ID (GitHub/GitLab ID)
	 * @param userName : 사용자 이름
	 * @param nickname :사용자 닉네임
	 * @param email : 사용자 이메일
	 * @param provider : 플랫폼(GitHub/GitLab)
	 * @param accessToken : 액세스 토큰
	 * @param response : HttpServletResponse
	 * @return User : 사용자 정보
	 */
	public User processUserLogin(String externalId, String userName, String nickname, String email,
		AuthProvider provider, String accessToken, HttpServletResponse response) {

		// 사용자 정보 조회 또는 생성
		User user = userRepository.findByExternalIdAndLoginProvider(externalId, provider).orElseGet(() -> {
			User newUser = User.builder()
				.externalId(externalId)
				.userName(userName)
				.nickname(nickname)
				.userEmail(email)
				.loginProvider(provider)
				.build();
			return userRepository.save(newUser); // save()를 통해 ID를 보장
		});

		// refresh 토큰 생성
		String jwtRefreshToken = jwtTokenProvider.createRefreshToken(user.getId());

		// 사용자 정보 업데이트
		user.updateUserName(userName);
		user.updateUserEmail(email);
		user.updateNickname(nickname);
		user.updateRefreshToken(jwtRefreshToken);

		// OAuthToken 저장
		saveOAuthToken(user, provider, accessToken);

		// HttpOnly 쿠키로 refreshToken 보내기
		Cookie refreshTokenCookie = new Cookie("refreshToken", jwtRefreshToken);
		refreshTokenCookie.setHttpOnly(true);
		// refreshTokenCookie.setSecure(true); // HTTPS에서만 전송
		refreshTokenCookie.setPath("/");
		refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60); // 7일
		response.addCookie(refreshTokenCookie);

		return user;
	}

	/**
	 * OAuthToken 저장
	 * @param user : 사용자 정보
	 * @param provider : 플랫폼(GitHub/GitLab)
	 * @param accessToken : 액세스 토큰
	 */
	public void saveOAuthToken(User user, AuthProvider provider, String accessToken) {
		OAuthToken oAuthToken = oAuthTokenRepository.findByUserIdAndServiceProvider(user.getId(), provider)
			.orElseGet(
				() -> OAuthToken.builder().user(user).serviceProvider(provider).accessToken(accessToken).build());

		oAuthToken.updateAccessToken(accessToken);
		oAuthTokenRepository.save(oAuthToken);
	}

	/**
	 * GitHub AccessToken 요청
	 * @param code : GitHub에서 받은 인증 코드
	 * @return String : 액세스 토큰
	 */
	private String getAccessTokenFromGithub(String code) {
		OAuthProperties.Provider github = oauthProperties.getProvider("github");

		Map<String, String> requestBody = new HashMap<>();
		requestBody.put("client_id", github.getClientId());
		requestBody.put("client_secret", github.getClientSecret());
		requestBody.put("code", code);
		requestBody.put("redirect_uri", github.getRedirectUri());

		// WebClient 요청
		Map response = webClient.post()
			.uri(github.getTokenUri())
			.header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
			.contentType(MediaType.APPLICATION_JSON)
			.bodyValue(requestBody)
			.retrieve()
			.bodyToMono(Map.class)
			.block(); // 동기 호출 (결과 기다림)

		if (response == null || !response.containsKey("access_token")) {
			log.error("GitHub에서 액세스 토큰을 가져오는 데 실패했습니다.");
			throw new CommonException(ErrorCode.OAuth2AuthenticationException);
		}

		return (String)response.get("access_token");
	}

	/**
	 * GitHub 사용자 정보 요청
	 *
	 * @param accessToken : 액세스 토큰
	 * @return Map<String, Object> : 사용자 정보
	 */
	private Map<String, Object> getUserInfoFromGithub(String accessToken) {
		OAuthProperties.Provider github = oauthProperties.getProvider("github");

		// WebClient 요청
		Map<String, Object> userInfo = webClient.get()
			.uri(github.getUserInfoUri())
			.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
			.header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
			.retrieve()
			.bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
			})
			.block(); // 동기 호출 (결과 기다림)

		if (userInfo == null) {
			log.error("GitHub에서 사용자 정보를 가져오는 데 실패했습니다.");
			throw new CommonException(ErrorCode.OAuth2AuthenticationProcessingFilter);
		}

		return userInfo;
	}

	/**
	 * GitHub 사용자 이메일 요청
	 * @param userInfo : 사용자 정보
	 * @param accessToken : 액세스 토큰
	 * @return String : 사용자 이메일
	 */
	private String getEmailFromGithub(Map<String, Object> userInfo, String accessToken) {
		// 1차 시도: userInfo에 email이 있으면 바로 사용
		if (userInfo.containsKey("email") && userInfo.get("email") != null) {
			return (String)userInfo.get("email");
		}

		// 2차 시도: /user/emails API 호출
		List<Map<String, Object>> emails = webClient.get()
			.uri("https://api.github.com/user/emails")
			.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
			.header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
			.retrieve()
			.bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {
			})
			.block();

		if (emails == null || emails.isEmpty()) {
			log.error("GitHub에서 이메일 목록을 가져오는 데 실패했습니다.");
			throw new CommonException(ErrorCode.OAuth2AuthenticationProcessingFilter);
		}

		// primary && verified == true 인 이메일을 찾아서 반환
		for (Map<String, Object> emailInfo : emails) {
			Boolean primary = (Boolean)emailInfo.get("primary");
			Boolean verified = (Boolean)emailInfo.get("verified");
			if (Boolean.TRUE.equals(primary) && Boolean.TRUE.equals(verified)) {
				return (String)emailInfo.get("email");
			}
		}

		log.error("GitHub 사용자 이메일을 찾을 수 없습니다.");
		throw new CommonException(ErrorCode.OAuth2AuthenticationProcessingFilter);
	}

	/**
	 * GitLab AccessToken 요청
	 * @param code : GitLab에서 받은 인증 코드
	 * @return String : 액세스 토큰
	 */
	private String getAccessTokenFromGitlab(String code) {
		OAuthProperties.Provider gitlab = oauthProperties.getProvider("gitlab");

		MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
		formData.add("client_id", gitlab.getClientId());
		formData.add("client_secret", gitlab.getClientSecret());
		formData.add("code", code);
		formData.add("grant_type", "authorization_code");
		formData.add("redirect_uri", gitlab.getRedirectUri());

		// WebClient 요청
		Map<String, Object> response = webClient.post()
			.uri(gitlab.getTokenUri())
			.contentType(MediaType.APPLICATION_FORM_URLENCODED)
			.body(BodyInserters.fromFormData(formData))
			.retrieve()
			.bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
			})
			.block(); // 동기 호출 (결과 기다림)

		if (response == null || !response.containsKey("access_token")) {
			log.error("GitLab에서 액세스 토큰을 가져오는 데 실패했습니다.");
			throw new CommonException(ErrorCode.OAuth2AuthenticationException);
		}

		return (String)response.get("access_token");
	}

	/**
	 * GitLab 사용자 정보 요청
	 * @param accessToken : 액세스 토큰
	 * @return Map<String, Object> : 사용자 정보
	 */
	private Map<String, Object> getUserInfoFromGitlab(String accessToken) {
		OAuthProperties.Provider gitlab = oauthProperties.getProvider("gitlab");

		// WebClient 요청
		Map<String, Object> userInfo = webClient.get()
			.uri(gitlab.getUserInfoUri())
			.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
			.header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
			.retrieve()
			.bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
			})
			.block(); // 동기 호출 (결과 기다림)

		if (userInfo == null) {
			log.error("GitLab에서 사용자 정보를 가져오는 데 실패했습니다.");
			throw new CommonException(ErrorCode.OAuth2AuthenticationProcessingFilter);
		}

		return userInfo;
	}

	/**
	 * 액세스 토큰 검증
	 * @param accessToken : 엑세스 토큰
	 */
	public void verifyToken(String accessToken) {
		jwtTokenProvider.validateToken(accessToken);
	}

	/**
	 * 리프레시 토큰으로 새로운 액세스 토큰 발급
	 * @param request : HttpServletRequest
	 * @param response : HttpServletResponse
	 * @return AuthResponse : 새로운 액세스 토큰을 포함한 응답
	 */
	public AuthResponse refreshToken(HttpServletRequest request, HttpServletResponse response) {
		Cookie[] cookies = request.getCookies();
		String refreshToken = null;

		if (cookies != null) {
			for (Cookie cookie : cookies) {
				if ("refreshToken".equals(cookie.getName())) {
					refreshToken = cookie.getValue();
					break;
				}
			}
		}

		if (refreshToken == null) {
			log.error("Refresh Token이 없습니다.");
			throw new CommonException(ErrorCode.INVALID_JWT_TOKEN);
		}

		Integer userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
		User user = userRepository.findById(userId).orElseThrow(() -> new CommonException(ErrorCode.USER_NOT_FOUND));

		String newAccessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getUserName(),
			user.getNickname());

		return new AuthResponse(newAccessToken, new LoginResponse(user));
	}

	/**
	 * 로그아웃 처리
	 * @param accessToken : 엑세스 토큰
	 * @param response : HttpServletResponse
	 */
	@Transactional
	public void logout(String accessToken, HttpServletResponse response) {
		if (jwtTokenProvider.validateToken(accessToken)) {
			Integer userId = jwtTokenProvider.getUserIdFromToken(accessToken);
			User user = userRepository.findById(userId)
				.orElseThrow(() -> new CommonException(ErrorCode.USER_NOT_FOUND));

			// DB에서 refreshToken 삭제
			user.updateRefreshToken(null);
			userRepository.save(user);

			// HttpOnly 쿠키에서 refreshToken 삭제
			Cookie refreshTokenCookie = new Cookie("refreshToken", null);
			refreshTokenCookie.setHttpOnly(true);
			refreshTokenCookie.setPath("/");
			refreshTokenCookie.setMaxAge(0); // 즉시 만료
			response.addCookie(refreshTokenCookie);

			// Redis에 blacklist 처리
			String redisKey = "blacklist:" + accessToken;
			redisTemplate.opsForValue()
				.set(redisKey, Integer.toString(userId), jwtTokenProvider.getJwtAccessExpiration());

		} else {
			log.error("Access Token이 유효하지 않습니다.");
			throw new CommonException(ErrorCode.INVALID_JWT_TOKEN);
		}
	}

	/**
	 * Jira 롤백 처리
	 * @param code : Jira에서 받은 인증 코드
	 * @param response :HttpServletResponse
	 */
	@Transactional
	public void processJiraCallback(String token, String code, HttpServletResponse response) {

		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// Jira에서 받은 인증 코드로 토큰 요청
		Map<String, Object> tokenResponse = exchangeCodeForTokens(code);

		String accessToken = (String)tokenResponse.get("access_token");
		String refreshToken = (String)tokenResponse.get("refresh_token");
		int expiresIn = (int)tokenResponse.get("expires_in");

		// 액세스 토큰으로 jira 인스턴스 id 가져오기
		String cloudId = fetchCloudId(accessToken);

		// 사용자 정보 조회
		User user = userRepository.findById(loginUserId)
			.orElseThrow(() -> new CommonException(ErrorCode.USER_NOT_FOUND));

		// Jira OAuthToken 저장
		OAuthToken oAuthToken = oAuthTokenRepository.findByUserIdAndServiceProvider(user.getId(), AuthProvider.JIRA)
			.orElseGet(() -> {
				OAuthToken newOAuthToken = OAuthToken.builder()
					.user(user)
					.serviceProvider(AuthProvider.JIRA)
					.accessToken(accessToken)
					.refreshToken(refreshToken)
					.expiresIn(LocalDateTime.now().plusSeconds(expiresIn))
					.cloudId(cloudId)
					.build();
				return oAuthTokenRepository.save(newOAuthToken);
			});

		oAuthToken.updateAccessToken(accessToken);
		oAuthToken.updateRefreshToken(refreshToken);
		oAuthToken.updateExpiresIn(LocalDateTime.now().plusSeconds(expiresIn));
		oAuthToken.updateCloudId(cloudId);
	}

	/**
	 * Jira에서 받은 인증 코드로 액세스 토큰 요청
	 * @param code : Jira에서 받은 인증 코드
	 * @return Map<String, Object> : 액세스 토큰과 리프레시 토큰을 포함한 응답
	 */
	private Map<String, Object> exchangeCodeForTokens(String code) {
		OAuthProperties.Provider jira = oauthProperties.getProvider("jira");

		MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
		formData.add("client_id", jira.getClientId());
		formData.add("client_secret", jira.getClientSecret());
		formData.add("code", code);
		formData.add("grant_type", "authorization_code");
		formData.add("redirect_uri", jira.getRedirectUri());

		return webClient.post()
			.uri(jira.getTokenUri())
			.body(BodyInserters.fromFormData(formData))
			.retrieve()
			.bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
			})
			.block(); // 동기 호출 (결과 기다림)
	}

	/**
	 * Jira에서 클라우드 ID를 가져오는 메서드
	 * @param accessToken : 액세스 토큰
	 * @return String : 클라우드 ID
	 */
	private String fetchCloudId(String accessToken) {
		OAuthProperties.Provider jira = oauthProperties.getProvider("jira");

		return webClient.get()
			.uri(jira.getApiUri() + "/oauth/token/accessible-resources")
			.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
			.retrieve()
			.bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {
			})
			.map(list -> (String)list.get(0).get("id"))
			.block(); // 동기 호출 (결과 기다림)
	}

	/**
	 * Jira 프로젝트 목록 조회
	 * @param token : 액세스 토큰
	 * @return List<JiraProjectListResponse> : Jira 프로젝트 목록
	 */
	@Transactional
	public List<JiraProjectListResponse> getJiraProjects(String token) {

		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// Jira OAuthToken 조회
		OAuthToken oAuthToken = oAuthTokenRepository.findByUserIdAndServiceProvider(loginUserId, AuthProvider.JIRA)
			.orElseThrow(() -> new CommonException(ErrorCode.OAuth2AuthenticationProcessingFilter));

		// Jira API 호출
		Map<String, Object> response = getJiraProjectsFromApi(oAuthToken);

		// 응답 값에서 values 필드에 프로젝트 리스트 존재.
		List<Map<String, Object>> projects = (List<Map<String, Object>>)response.get("values");

		return projects.stream()
			.map(project -> new JiraProjectListResponse(String.valueOf(project.get("id")),
				String.valueOf(project.get("key")), String.valueOf(project.get("name")),
				String.valueOf(project.get("projectTypeKey"))))
			.collect(Collectors.toList());
	}

	/**
	 * Jira API 호출
	 * @param oAuthToken : OAuthToken
	 * @return Map<String, Object> : Jira 프로젝트 목록
	 */
	private Map<String, Object> getJiraProjectsFromApi(OAuthToken oAuthToken) {
		OAuthProperties.Provider jira = oauthProperties.getProvider("jira");

		return webClient.get()
			.uri(jira.getApiUri() + "/ex/jira/{cloudId}/rest/api/3/project/search", oAuthToken.getCloudId())
			.header(HttpHeaders.AUTHORIZATION, "Bearer " + getValidJiraAccessToken(oAuthToken))
			.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
			.retrieve()
			.bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
			})
			.block(); // 동기 호출 (결과 기다림)
	}

	/**
	 * Jira 보드 ID 조회
	 * @param loginUserId : 로그인한 사용자 ID
	 * @param jiraProjectKey : Jira 프로젝트 키
	 * @return Long : Jira 보드 ID
	 */
	public Long getBoardId(Integer loginUserId, String jiraProjectKey) {
		// Jira OAuthToken 조회
		OAuthToken oAuthToken = oAuthTokenRepository.findByUserIdAndServiceProvider(loginUserId, AuthProvider.JIRA)
			.orElseThrow(() -> new CommonException(ErrorCode.OAuth2AuthenticationProcessingFilter));

		// Jira API 호출
		Map<String, Object> response = getJiraBoardIdFromApi(oAuthToken, jiraProjectKey);

		// 응답 값에서 values 필드에 보드 ID 존재.
		List<Map<String, Object>> boards = (List<Map<String, Object>>)response.get("values");

		log.info("Jira 보드 ID 조회 결과: {}", boards);

		if (boards.isEmpty()) {
			log.error("Jira 보드를 찾을 수 없습니다.");
			throw new CommonException(ErrorCode.OAuth2AuthenticationProcessingFilter);
		}

		return Long.valueOf(boards.get(0).get("id").toString());
	}

	/**
	 * Jira API 호출
	 * @param oAuthToken : OAuthToken
	 * @param jiraProjectKey : Jira 프로젝트 키
	 * @return Map<String, Object> : Jira 보드 ID
	 */
	private Map<String, Object> getJiraBoardIdFromApi(OAuthToken oAuthToken, String jiraProjectKey) {
		OAuthProperties.Provider jira = oauthProperties.getProvider("jira");

		return webClient.get()
			.uri(jira.getApiUri() + "/ex/jira/{cloudId}/rest/agile/1.0/board?projectKeyOrId={jiraProjectKey}",
				oAuthToken.getCloudId(), jiraProjectKey)
			.header(HttpHeaders.AUTHORIZATION, "Bearer " + getValidJiraAccessToken(oAuthToken))
			.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
			.retrieve()
			.bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
			})
			.block(); // 동기 호출 (결과 기다림)
	}

	/**
	 * Jira 연동 여부 확인
	 * @param token : 액세스 토큰
	 * @return Boolean : Jira 연동 여부
	 */
	@Transactional(readOnly = true)
	public Boolean isJiraLinked(String token) {
		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// Jira OAuthToken 조회
		return oAuthTokenRepository.existsByUserIdAndServiceProvider(loginUserId, AuthProvider.JIRA);
	}

	/**
	 * Jira 사용자 조회
	 * @param loginUserId : 로그인한 사용자 ID
	 * @param projectMembersWithEmail : 프로젝트 멤버 리스트
	 * @return HashMap<Integer, String> : 회원 ID와 Jira 계정 ID 매핑
	 */
	public HashMap<Integer, String> getJiraUsers(Integer loginUserId,
		List<ProjectMemberWithEmailResponse> projectMembersWithEmail) {
		// Jira OAuthToken 조회
		OAuthToken oAuthToken = oAuthTokenRepository.findByUserIdAndServiceProvider(loginUserId, AuthProvider.JIRA)
			.orElseThrow(() -> new CommonException(ErrorCode.OAuth2AuthenticationProcessingFilter));

		HashMap<Integer, String> emailToJiraAccountId = new HashMap<>();

		for (ProjectMemberWithEmailResponse projectMember : projectMembersWithEmail) {
			String email = projectMember.getEmail();

			List<Map<String, Object>> uesr = fetchJiraAccountId(oAuthToken, email);

			String jiraAccountId = null;

			if (uesr == null || uesr.isEmpty()) {
				log.error("Jira 사용자 정보를 찾을 수 없습니다.");
			} else {
				jiraAccountId = (String)uesr.get(0).get("accountId").toString();
			}

			emailToJiraAccountId.put(projectMember.getUserId(), jiraAccountId);
		}

		return emailToJiraAccountId;
	}

	private List<Map<String, Object>> fetchJiraAccountId(OAuthToken oAuthToken, String email) {
		OAuthProperties.Provider jira = oauthProperties.getProvider("jira");

		return webClient.get()
			.uri(jira.getApiUri() + "/ex/jira/{cloudId}/rest/api/3/user/search?query={email}", oAuthToken.getCloudId(),
				email)
			.header(HttpHeaders.AUTHORIZATION, "Bearer " + getValidJiraAccessToken(oAuthToken))
			.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
			.retrieve()
			.bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {
			})
			.block(); // 동기 호출 (결과 기다림)
	}

	/**
	 * Jira Story Point 필드 조회
	 * @param loginUserId : 로그인한 사용자 ID
	 * @return String : Jira Story Point 필드
	 */
	public String getStoryPointFieldId(Integer loginUserId) {
		OAuthProperties.Provider jira = oauthProperties.getProvider("jira");

		// Jira OAuthToken 조회
		OAuthToken oAuthToken = oAuthTokenRepository.findByUserIdAndServiceProvider(loginUserId, AuthProvider.JIRA)
			.orElseThrow(() -> new CommonException(ErrorCode.OAuth2AuthenticationProcessingFilter));

		// Jira API 호출
		List<Map<String, Object>> response = webClient.get()
			.uri(jira.getApiUri() + "/ex/jira/{cloudId}/rest/api/3/field", oAuthToken.getCloudId())
			.header(HttpHeaders.AUTHORIZATION, "Bearer " + getValidJiraAccessToken(oAuthToken))
			.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
			.retrieve()
			.bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {
			})
			.block(); // 동기 호출 (결과 기다림)

		if (response == null || response.isEmpty()) {
			log.error("Jira Story Point 필드를 찾을 수 없습니다.");
		}

		for (Map<String, Object> field : response) {
			String name = field.get("name").toString().toLowerCase();
			if (name.contains("story point")) {
				return field.get("id").toString();
			}
		}

		return null;
	}

	/**
	 * Jira 이슈 생성
	 * @param loginUserId : 로그인한 사용자 ID
	 * @param jiraProjectEntity : Jira 프로젝트 엔티티
	 * @param functionalSpecResponses : 기능 명세서 리스트
	 * @param userIdToJiraAccountId : 회원 ID와 Jira 계정 ID 매핑
	 * @param storyPointField : Jira Story Point 필드
	 */
	public void createJiraIssues(Integer loginUserId, JiraProjectEntity jiraProjectEntity,
		List<FunctionalSpecResponse> functionalSpecResponses, HashMap<Integer, String> userIdToJiraAccountId,
		String storyPointField) {
		OAuthProperties.Provider jira = oauthProperties.getProvider("jira");

		// Jira OAuthToken 조회
		OAuthToken oAuthToken = oAuthTokenRepository.findByUserIdAndServiceProvider(loginUserId, AuthProvider.JIRA)
			.orElseThrow(() -> new CommonException(ErrorCode.OAuth2AuthenticationProcessingFilter));

		for (FunctionalSpecResponse spec : functionalSpecResponses) {
			Integer assigneeId = spec.getUserId();
			String accountId = userIdToJiraAccountId.get(assigneeId);

			if (accountId == null) {
				log.warn("Jira 사용자 accountId를 찾을 수 없음: {}", accountId);
			}

			Map<String, Object> description = formatADFDescription(spec);
			String priorityName = mapPriority(spec.getPriority());

			Map<String, Object> fields = new HashMap<>();
			fields.put("project", Map.of("key", jiraProjectEntity.getJiraProjectKey()));
			fields.put("summary", spec.getFunctionName());
			fields.put("description", description);
			fields.put("issuetype", Map.of("name", "Story"));
			fields.put("priority", Map.of("name", priorityName));
			fields.put("assignee", Map.of("accountId", accountId));

			if (storyPointField != null) {
				fields.put(storyPointField, spec.getStoryPoint());
			}

			webClient.post()
				.uri(jira.getApiUri() + "/ex/jira/{cloudId}/rest/api/3/issue", oAuthToken.getCloudId())
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + getValidJiraAccessToken(oAuthToken))
				.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
				.bodyValue(Map.of("fields", fields))
				.retrieve()
				.bodyToMono(Map.class)
				.doOnNext(
					response -> log.info("Jira 이슈 생성 성공: {}, 제목: {}", response.get("key"), spec.getFunctionName()))
				.doOnError(error -> log.error("Jira 이슈 생성 실패 - {}: {}", spec.getFunctionName(), error.getMessage()))
				.subscribe(); // 비동기 실행
		}
	}

	private Map<String, Object> formatADFDescription(FunctionalSpecResponse spec) {
		return Map.of(
			"type", "doc",
			"version", 1,
			"content", List.of(
				Map.of("type", "paragraph", "content", List.of(boldText("기능 설명"))),
				Map.of("type", "paragraph", "content", List.of(text(spec.getFunctionDescription()))),
				Map.of("type", "paragraph", "content", List.of(boldText("성공 케이스"))),
				Map.of("type", "paragraph", "content", List.of(text(spec.getSuccessCase()))),
				Map.of("type", "paragraph", "content", List.of(boldText("실패 케이스"))),
				Map.of("type", "paragraph", "content", List.of(text(spec.getFailCase())))
			)
		);
	}

	private Map<String, Object> text(String text) {
		return Map.of("type", "text", "text", text);
	}

	private Map<String, Object> boldText(String text) {
		return Map.of(
			"type", "text",
			"text", text,
			"marks", List.of(Map.of("type", "strong"))
		);
	}

	private String mapPriority(int priority) {
		return switch (priority) {
			case 1 -> "Highest";
			case 2 -> "High";
			case 4 -> "Low";
			case 5 -> "Lowest";
			default -> "Medium";
		};
	}

	private String getValidJiraAccessToken(OAuthToken token) {
		// 만료되었거나, 1분 이내로 만료될 예정이면 갱신
		if (token.getExpiresIn().isBefore(LocalDateTime.now().plusMinutes(1))) {
			// 리프레시 토큰으로 새로운 액세스 토큰을 발급
			log.info("Jira 액세스 토큰이 만료되었습니다. 갱신 중...");
			return refreshAccessToken(token);
		}
		log.info("Jira 액세스 토큰이 유효합니다. 만료 시간: {}", token.getExpiresIn());
		return token.getAccessToken();
	}

	private String refreshAccessToken(OAuthToken token) {
		OAuthProperties.Provider jira = oauthProperties.getProvider("jira");

		MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
		formData.add("grant_type", "refresh_token");
		formData.add("client_id", jira.getClientId());
		formData.add("client_secret", jira.getClientSecret());
		formData.add("refresh_token", token.getRefreshToken());

		Map<String, Object> response = webClient.post()
			.uri(jira.getTokenUri())
			.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
			.body(BodyInserters.fromFormData(formData))
			.retrieve()
			.bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
			})
			.block();

		String newAccessToken = response.get("access_token").toString();
		String newRefreshToken = response.get("refresh_token").toString();
		int expiresIn = (int)response.get("expires_in");
		LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(expiresIn);

		// DB 업데이트
		token.updateAccessToken(newAccessToken);
		token.updateExpiresIn(expiresAt);
		token.updateRefreshToken(newRefreshToken);
		oAuthTokenRepository.save(token);

		return newAccessToken;
	}
}
