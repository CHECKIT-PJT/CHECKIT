package com.checkmate.checkit.project.service;

import java.util.HashMap;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.checkmate.checkit.auth.service.AuthService;
import com.checkmate.checkit.functional.dto.response.FunctionalSpecResponse;
import com.checkmate.checkit.functional.service.FunctionalSpecService;
import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.config.JwtTokenProvider;
import com.checkmate.checkit.global.exception.CommonException;
import com.checkmate.checkit.project.dto.request.JiraProjectUpdateRequest;
import com.checkmate.checkit.project.dto.response.ProjectMemberWithEmailResponse;
import com.checkmate.checkit.project.entity.JiraProjectEntity;
import com.checkmate.checkit.project.entity.ProjectEntity;
import com.checkmate.checkit.project.repository.JiraProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class JiraProjectService {

	private final JiraProjectRepository jiraProjectRepository;
	private final ProjectService projectService;
	private final JwtTokenProvider jwtTokenProvider;
	private final AuthService authService;
	private final FunctionalSpecService functionalSpecService;

	/**
	 * Jira 프로젝트 등록
	 * @param token : JWT 토큰
	 * @param projectId : 프로젝트 ID
	 * @param jiraProjectUpdateRequest : Jira 프로젝트 등록 요청 DTO
	 */
	@Transactional
	public void registerJira(String token, Integer projectId, JiraProjectUpdateRequest jiraProjectUpdateRequest) {
		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// 프로젝트 소속 유저인지 확인 후, 프로젝트 정보 가져오기
		ProjectEntity projectEntity = projectService.validateAndGetProject(loginUserId, projectId);

		// 기존 JiraProjectEntity 있는지 확인
		JiraProjectEntity jiraProjectEntity = jiraProjectRepository.findById(projectId)
			.orElseGet(() -> jiraProjectUpdateRequest.toEntity(projectEntity));

		// board ID를 호출
		Long boardId = authService.getBoardId(loginUserId, jiraProjectUpdateRequest.projectKey());

		jiraProjectEntity.updateJiraBoardId(boardId);

		// 필드 업데이트
		jiraProjectEntity.updateFromRequest(jiraProjectUpdateRequest);

		jiraProjectRepository.save(jiraProjectEntity);
	}

	/**
	 * 기능 명세서 기반으로 Jira 이슈 생성
	 * @param token : JWT 토큰
	 * @param projectId : 프로젝트 ID
	 */
	public void createJiraIssues(String token, Integer projectId) {
		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// 프로젝트 소속 유저인지 확인 후, 프로젝트 정보 가져오기
		ProjectEntity projectEntity = projectService.validateAndGetProject(loginUserId, projectId);

		// JiraProjectEntity 있는지 확인
		JiraProjectEntity jiraProjectEntity = jiraProjectRepository.findById(projectId)
			.orElseThrow(() -> new CommonException(ErrorCode.JIRA_PROJECT_NOT_FOUND));

		// 프로젝트 ID로 프로젝트 멤버 Email과 함께 조회
		List<ProjectMemberWithEmailResponse> projectMembersWithEmail = projectService.getProjectMembersWithEmail(
			projectId);

		// Jira API를 통해 프로젝트 멤버와 Jira에서 회원 맵핑
		HashMap<Integer, String> userIdToJiraAccountId = authService.getJiraUsers(loginUserId, projectMembersWithEmail);

		// Jira Story Point 필드 값 가져오기
		String storyPointFieldId = authService.getStoryPointFieldId(loginUserId);

		// 기능 명세서 호출
		List<FunctionalSpecResponse> functionalSpecResponses = functionalSpecService.getSpecsByProject(projectId);

		// Jira API를 통해 이슈 생성
		authService.createJiraIssues(loginUserId, jiraProjectEntity, functionalSpecResponses,
			userIdToJiraAccountId, storyPointFieldId);
	}
}
