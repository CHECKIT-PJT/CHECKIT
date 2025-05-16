package com.checkmate.checkit.git.service;

import java.net.URI;
import java.nio.file.Path;
import java.util.Map;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.transport.URIish;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.checkmate.checkit.auth.entity.OAuthToken;
import com.checkmate.checkit.auth.repository.OAuthTokenRepository;
import com.checkmate.checkit.git.dto.request.GitPushRequest;
import com.checkmate.checkit.git.dto.response.GitPushResponse;
import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.common.enums.AuthProvider;
import com.checkmate.checkit.global.config.JwtTokenProvider;
import com.checkmate.checkit.global.config.properties.OAuthProperties;
import com.checkmate.checkit.global.exception.CommonException;
import com.checkmate.checkit.projectbuilder.service.ProjectBuilderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class GitPushService {

	private final OAuthProperties oAuthProperties;
	private final OAuthTokenRepository oAuthTokenRepository;
	private final JwtTokenProvider jwtTokenProvider;
	private final ProjectBuilderService projectBuilderService;
	private final WebClient webClient = WebClient.builder()
		.defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
		.build();

	/**
	 * Git Repository가 존재하는지 확인 후, 없으면 새로 생성하고
	 * 코드를 생성하여 Git Repository에 푸시하는 메서드
	 * @param jwtAccessToken : JWT Access Token
	 * @param projectId : Project ID
	 * @param gitPushRequest : Git Push Request
	 * @return
	 */
	public GitPushResponse pushRepository(String jwtAccessToken, Integer projectId, GitPushRequest gitPushRequest) {

		Integer userId = jwtTokenProvider.getUserIdFromToken(jwtAccessToken);
		String userName = jwtTokenProvider.getUserNameFromToken(jwtAccessToken);

		OAuthToken oAuthToken = oAuthTokenRepository.findByUserIdAndServiceProvider(userId, AuthProvider.GITLAB)
			.orElseThrow(() -> new CommonException(ErrorCode.USER_NOT_FOUND));

		String accessToken = oAuthToken.getAccessToken();
		String authProvider = oAuthToken.getServiceProvider().toString().toLowerCase();

		// Git API를 사용하여 저장소가 존재하는지 확인 후, 없으면 새로 생성
		String repositoryUrl = checkAndCreateGitRepository(userName, accessToken, authProvider, gitPushRequest);
		log.info("Git repository url: {}", repositoryUrl);

		// 코드 생성 및 푸시 구현
		generateCodeAndPushToGit(accessToken, projectId, gitPushRequest, repositoryUrl);

		return new GitPushResponse(repositoryUrl);
	}

	/**
	 * Git Repository가 존재하는지 확인 후, 없으면 새로 생성하는 메서드
	 * @param userName : 사용자 이름
	 * @param accessToken : OAuth Access Token
	 * @param authProvider : OAuth 제공자 (github, gitlab 등)
	 * @param gitPushRequest : Git Push Request
	 * @return : Git Repository URL
	 */
	private String checkAndCreateGitRepository(String userName, String accessToken, String authProvider,
		GitPushRequest gitPushRequest) {

		String encodedPath = userName + "%2F" + gitPushRequest.repoName();
		String fullUri = oAuthProperties.getProvider(authProvider).getApiUri() + "/projects/" + encodedPath;

		// Git API를 사용하여 저장소가 존재하는지 확인
		Mono<Map> getRepoMono = webClient.get()
			.uri(URI.create(fullUri))
			.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
			.retrieve()
			.bodyToMono(Map.class)
			.onErrorResume(error -> {
				// 존재하지 않으면 404 에러 발생 -> 새로 생성
				log.error("Git repository not found: {}", error.getMessage());
				return createGitProject(accessToken, authProvider, gitPushRequest);
			});

		// 2. 결과에서 Git 저장소 URL을 가져옴
		return getRepoMono.map(response -> {
			Object url = response.get("http_url_to_repo");
			if (url instanceof String)
				return (String)url;
			throw new CommonException(ErrorCode.FAILED_TO_CREATE_REPOSITORY);
		}).block();
	}

	/**
	 * Git Repository를 생성하는 메서드
	 * @param accessToken : OAuth Access Token
	 * @param authProvider : OAuth 제공자 (github, gitlab 등)
	 * @param gitPushRequest : Git Push Request
	 * @return : Git Repository URL
	 */
	private Mono<Map> createGitProject(String accessToken, String authProvider,
		GitPushRequest gitPushRequest) {

		String fullUri = oAuthProperties.getProvider(authProvider).getApiUri() + "/projects/";

		return webClient.post()
			.uri(URI.create(fullUri))
			.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
			.bodyValue(Map.of("name", gitPushRequest.repoName(), "visibility",
				gitPushRequest.visibility()))
			.retrieve()
			.bodyToMono(Map.class)
			.onErrorMap(error -> {
				log.error("Git repository 생성 실패: {}", error.getMessage());
				return new CommonException(ErrorCode.FAILED_TO_CREATE_REPOSITORY);
			});
	}

	/**
	 * Git Repository에 코드를 생성하고 푸시하는 메서드
	 * @param accessToken : OAuth Access Token
	 * @param projectId : Project ID
	 * @param gitPushRequest : Git Push Request
	 * @param repositoryUrl : Git Repository URL
	 */
	private void generateCodeAndPushToGit(String accessToken, Integer projectId, GitPushRequest gitPushRequest,
		String repositoryUrl) {

		try {

			// 1. 코드 생성
			Path codeDir = projectBuilderService.buildProject(projectId);

			// 2. Git 저장소 초기화
			Git git = Git.init()
				.setDirectory(codeDir.toFile())
				.call();

			// 3. Git 커밋
			git.add().addFilepattern(".").call();
			git.commit().setMessage(gitPushRequest.message()).call();

			// 4. remote 설정
			String authenticatedUrl = repositoryUrl.replace("https://", "https://oauth2:" + accessToken + "@");

			git.remoteAdd()
				.setName("origin")
				.setUri(new URIish(authenticatedUrl))
				.call();

			// 5. push
			git.push()
				.setRemote(repositoryUrl)
				.setCredentialsProvider(new UsernamePasswordCredentialsProvider("oauth2", accessToken))
				.call();

			log.info("푸시 완료: {}", repositoryUrl);
		} catch (Exception e) {
			log.error("푸시 실패", e);
			throw new CommonException(ErrorCode.FAILED_TO_PUSH_REPOSITORY);
		}
	}
}
