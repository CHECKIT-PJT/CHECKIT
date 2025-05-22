package com.checkmate.checkit.git.service;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.net.URI;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.transport.URIish;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import com.checkmate.checkit.auth.entity.OAuthToken;
import com.checkmate.checkit.auth.repository.OAuthTokenRepository;
import com.checkmate.checkit.git.dto.request.CommitAndPushRequest;
import com.checkmate.checkit.git.dto.request.GitPushRequest;
import com.checkmate.checkit.git.dto.response.GitFileNode;
import com.checkmate.checkit.git.dto.response.GitPullResponse;
import com.checkmate.checkit.git.dto.response.GitPushResponse;
import com.checkmate.checkit.git.dto.response.GitRepositoryInfo;
import com.checkmate.checkit.git.repository.GitSettingRepository;
import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.common.enums.AuthProvider;
import com.checkmate.checkit.global.config.JwtTokenProvider;
import com.checkmate.checkit.global.config.properties.OAuthProperties;
import com.checkmate.checkit.global.exception.CommonException;
import com.checkmate.checkit.project.dto.response.ProjectMemberWithExternalIdResponse;
import com.checkmate.checkit.project.service.ProjectService;
import com.checkmate.checkit.projectbuilder.service.ProjectBuilderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class GitAPIService {

	private final OAuthProperties oAuthProperties;
	private final OAuthTokenRepository oAuthTokenRepository;
	private final JwtTokenProvider jwtTokenProvider;
	private final ProjectBuilderService projectBuilderService;
	private final ProjectService projectService;
	private final FileExplorerService fileExplorerService;
	private final GitSettingRepository gitSettingRepository;
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

		// 이미 Git Repository가 존재하는지 확인
		String projectGitUrl = projectService.getGitUrl(projectId);
		if (projectGitUrl != null && !projectGitUrl.isEmpty()) {
			log.info("저장된 Git Repository Url: {}", projectGitUrl);
			return new GitPushResponse(projectGitUrl);
		}

		OAuthToken oAuthToken = oAuthTokenRepository.findByUserIdAndServiceProvider(userId, AuthProvider.GITLAB)
			.orElseThrow(() -> new CommonException(ErrorCode.USER_NOT_FOUND));

		String accessToken = oAuthToken.getAccessToken();
		String authProvider = oAuthToken.getServiceProvider().toString().toLowerCase();

		// Git API를 사용하여 저장소가 존재하는지 확인 후, 없으면 새로 생성
		GitRepositoryInfo gitRepositoryInfo = checkAndCreateGitRepository(userName, accessToken, authProvider,
			gitPushRequest);
		log.info("Git repository url: {}", gitRepositoryInfo.getUrl());

		// 코드 생성 및 푸시
		generateCodeAndPushToGit(accessToken, projectId, gitPushRequest, gitRepositoryInfo.getUrl());

		// Git Repository URL 저장
		projectService.saveGitUrl(projectId, gitRepositoryInfo.getUrl());

		// 팀원 초대
		inviteTeamMembersToGitRepository(accessToken, projectId, userId, gitRepositoryInfo.getGitlabProjectId());

		return new GitPushResponse(gitRepositoryInfo.getUrl());
	}

	/**
	 * Git Repository가 존재하는지 확인 후, 없으면 새로 생성하는 메서드
	 * @param userName : 사용자 이름
	 * @param accessToken : OAuth Access Token
	 * @param authProvider : OAuth 제공자 (github, gitlab 등)
	 * @param gitPushRequest : Git Push Request
	 * @return : Git Repository URL
	 */
	private GitRepositoryInfo checkAndCreateGitRepository(String userName, String accessToken, String authProvider,
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
			Object id = response.get("id");
			if (url instanceof String && id instanceof Integer) {
				return new GitRepositoryInfo((String)url, (Integer)id);
			}
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
	private Mono<Map> createGitProject(String accessToken, String authProvider, GitPushRequest gitPushRequest) {

		String fullUri = oAuthProperties.getProvider(authProvider).getApiUri() + "/projects/";

		return webClient.post()
			.uri(URI.create(fullUri))
			.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
			.bodyValue(Map.of("name", gitPushRequest.repoName(), "visibility", gitPushRequest.visibility()))
			.retrieve()
			.bodyToMono(Map.class)
			.onErrorMap(error -> {
				log.error("Git repository 생성 실패: {}", error.getMessage());
				return new CommonException(ErrorCode.FAILED_TO_CREATE_REPOSITORY);
			});
	}

	/**
	 * Git Repository에 팀원 초대하는 메서드
	 * @param accessToken : OAuth Access Token
	 * @param projectId : Project ID
	 */
	public void inviteTeamMembersToGitRepository(String accessToken, int projectId, Integer loginUserId,
		int gitlabProjectId) {
		List<ProjectMemberWithExternalIdResponse> memberEmails = projectService.getProjectMembersWithExternalId(
			projectId);
		for (ProjectMemberWithExternalIdResponse projectMember : memberEmails) {
			String externalId = projectMember.getExternalId();

			// 로그인한 사용자는 초대하지 않음
			if (projectMember.getUserId().equals(loginUserId)) {
				log.info("로그인한 사용자 초대 제외: {}", externalId);
				continue;
			}

			try {
				// 1. GitLab user_id 조회
				int userId = Integer.parseInt(externalId);

				// 2. 프로젝트에 멤버로 추가
				addMemberToGitlabProject(userId, accessToken, gitlabProjectId);
				log.info("GitLab 사용자 초대 완료: {} (ID: {})", projectMember.getUserId(), userId);

			} catch (Exception e) {
				log.error("GitLab 사용자 초대 실패 - email: {}, reason: {}", projectMember.getUserId(), e.getMessage(), e);
			}
		}
	}

	/**
	 * GitLab 프로젝트에 사용자를 멤버로 추가하는 메서드
	 * @param userId : GitLab 사용자 ID
	 * @param accessToken : OAuth Access Token
	 * @param gitlabProjectId : GitLab프로젝트 ID
	 */
	private void addMemberToGitlabProject(int userId, String accessToken, int gitlabProjectId) {
		webClient.post()
			.uri("https://lab.ssafy.com/api/v4/projects/" + gitlabProjectId + "/members")
			.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
			.contentType(MediaType.APPLICATION_JSON)
			.bodyValue(Map.of(
				"user_id", userId,
				"access_level", 30 // Developer
			))
			.retrieve()
			.bodyToMono(Void.class)
			.block();  // 동기 호출
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
			Git git = Git.init().setDirectory(codeDir.toFile()).call();

			// 3. Git 커밋
			git.add().addFilepattern(".").call();
			git.commit().setMessage(gitPushRequest.message()).call();

			// 4. remote 설정
			String authenticatedUrl = repositoryUrl.replace("https://", "https://oauth2:" + accessToken + "@");

			git.remoteAdd().setName("origin").setUri(new URIish(authenticatedUrl)).call();

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

	/**
	 * Git Repository를 Pull하는 메서드
	 * @param token : OAuth Access Token
	 * @param projectId : Project ID
	 * @return : Git Pull Response
	 */
	@Transactional
	public GitPullResponse pullRepository(String token, Integer projectId) {
		Integer userId = jwtTokenProvider.getUserIdFromToken(token);

		// 로그인한 회원이 프로젝트에 참여하고 있는지 확인
		projectService.validateUserAndProject(userId, projectId);

		String accessToken = oAuthTokenRepository.findByUserIdAndServiceProvider(userId, AuthProvider.GITLAB)
			.orElseThrow(() -> new CommonException(ErrorCode.USER_NOT_FOUND))
			.getAccessToken();

		// 저장된 Git Repository URL 가져오기
		String savedGitUrl = projectService.getGitUrl(projectId);
		if (savedGitUrl == null || savedGitUrl.isEmpty()) {
			throw new CommonException(ErrorCode.GIT_REPOSITORY_NOT_FOUND);
		}

		// accessToken 삽입
		String remoteUrl = savedGitUrl.replace("https://", "https://oauth2:" + accessToken + "@");

		// 프로젝트 이름 가져오기
		String projectName = projectService.getProjectName(projectId);

		// 작업 디렉토리 지정
		Path localPath = Paths.get("/tmp/git", projectId.toString(), projectName);
		File localRepoDir = localPath.toFile();

		Git git;
		try {
			if (!localRepoDir.exists()) {
				// 최초 clone
				git = Git.cloneRepository().setURI(remoteUrl).setDirectory(localRepoDir).call();
			} else {
				// 이후 pull
				git = Git.open(localRepoDir);
				git.pull()
					.setRemote("origin")
					.setCredentialsProvider(new UsernamePasswordCredentialsProvider("oauth2", accessToken))
					.call();
			}
		} catch (Exception e) {
			log.info("Git Repository Pull 실패", e);
			throw new CommonException(ErrorCode.FAILED_TO_PULL_REPOSITORY);
		}

		// 이후 디렉토리 탐색 및 파일 리스트 구성
		List<GitFileNode> fileNodes = fileExplorerService.scanDirectory(localRepoDir);

		return new GitPullResponse(projectName, "main", fileNodes);
	}

	/**
	 * Git Repository를 commit하고 push하는 메서드
	 * @param token : OAuth Access Token
	 * @param projectId : Project ID
	 */
	@Transactional
	public void commitAndPushRepository(String token, Integer projectId, CommitAndPushRequest commitAndPushRequest) {
		Integer userId = jwtTokenProvider.getUserIdFromToken(token);

		// 로그인한 회원이 프로젝트에 참여하고 있는지 확인
		projectService.validateUserAndProject(userId, projectId);

		// commit convention 가져오기
		String commitConvention = gitSettingRepository.findByProjectId(projectId)
			.orElseThrow(() -> new CommonException(ErrorCode.GIT_SETTING_NOT_FOUND))
			.getCommitConventionReg();

		// 커밋 메시지 유효성 검사 (commit-msg 역할)
		validateCommitMessage(commitAndPushRequest.message(), commitConvention);

		// Git 저장소 위치 설정
		String projectName = projectService.getProjectName(projectId);
		String accessToken = oAuthTokenRepository.findByUserIdAndServiceProvider(userId, AuthProvider.GITLAB)
			.orElseThrow(() -> new CommonException(ErrorCode.USER_NOT_FOUND))
			.getAccessToken();
		File repoDir = Paths.get("/tmp/git", projectId.toString(), projectName).toFile();

		// 변경 파일을 로컬 디렉토리에 덮어쓰기
		for (GitFileNode file : commitAndPushRequest.changedFiles()) {
			File targetFile = new File(repoDir, file.getPath());

			// 디렉토리 없으면 생성
			targetFile.getParentFile().mkdirs();

			try (FileWriter writer = new FileWriter(targetFile)) {
				writer.write(file.getContent());
			} catch (IOException e) {
				throw new RuntimeException("파일 쓰기 실패: " + file.getPath(), e);
			}
		}

		try (Git git = Git.open(repoDir)) {
			// 변경된 파일 add
			for (GitFileNode file : commitAndPushRequest.changedFiles()) {
				git.add().addFilepattern(file.getPath()).call();
			}

			// 커밋
			git.commit().setMessage(commitAndPushRequest.message()).call();

			// push
			git.push()
				.setRemote("origin")
				.setCredentialsProvider(new UsernamePasswordCredentialsProvider("oauth2", accessToken))
				.call();

		} catch (Exception e) {
			throw new CommonException(ErrorCode.FAILED_TO_COMMIT_AND_PUSH_REPOSITORY);
		}
	}

	/**
	 * 커밋 메시지 유효성 검사
	 * @param message : 커밋 메시지
	 * @param regex : 정규 표현식
	 */
	private void validateCommitMessage(String message, String regex) {

		if (message == null || message.isBlank()) {
			throw new CommonException(ErrorCode.INVALID_COMMIT_MESSAGE);
		}

		if (!message.matches(regex)) {
			throw new CommonException(ErrorCode.INVALID_COMMIT_CONVENTION,
				"커밋 메시지가 규칙에 맞지 않습니다.\n" + "규칙: " + regex + "\n" + "현재 커밋 메시지: " + message);
		}
	}
}
