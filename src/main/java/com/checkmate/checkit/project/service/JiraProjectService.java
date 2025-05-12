package com.checkmate.checkit.project.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.checkmate.checkit.auth.service.AuthService;
import com.checkmate.checkit.global.config.JwtTokenProvider;
import com.checkmate.checkit.project.dto.request.JiraProjectUpdateRequest;
import com.checkmate.checkit.project.entity.JiraProjectEntity;
import com.checkmate.checkit.project.entity.ProjectEntity;
import com.checkmate.checkit.project.repository.JiraProjectRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JiraProjectService {

	private final JiraProjectRepository jiraProjectRepository;
	private final ProjectService projectService;
	private final JwtTokenProvider jwtTokenProvider;
	private final AuthService authService;

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
}
