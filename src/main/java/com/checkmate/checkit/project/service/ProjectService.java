package com.checkmate.checkit.project.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.checkmate.checkit.global.config.JwtTokenProvider;
import com.checkmate.checkit.project.dto.request.ProjectCreateRequest;
import com.checkmate.checkit.project.dto.response.ProjectCreateResponse;
import com.checkmate.checkit.project.entity.ProjectEntity;
import com.checkmate.checkit.project.entity.ProjectMemberEntity;
import com.checkmate.checkit.project.entity.ProjectMemberId;
import com.checkmate.checkit.project.entity.ProjectMemberRole;
import com.checkmate.checkit.project.repository.ProjectMemberRepository;
import com.checkmate.checkit.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectService {

	private final ProjectRepository projectRepository;
	private final ProjectMemberRepository projectMemberRepository;
	private final JwtTokenProvider jwtTokenProvider;

	/**
	 * 프로젝트 생성
	 * @param token : JWT 토큰
	 * @param projectCreateRequest : 프로젝트 생성 요청 DTO
	 * @return projectCreateResponse : 프로젝트 생성 응답 DTO
	 */
	@Transactional
	public ProjectCreateResponse createProject(String token, ProjectCreateRequest projectCreateRequest) {

		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// 프로젝트 생성
		ProjectEntity project = projectRepository.save(projectCreateRequest.toEntity());

		// 프로젝트 멤버에 소유자 역할로 추가
		ProjectMemberId projectMemberId = new ProjectMemberId(project.getId(), loginUserId);
		ProjectMemberEntity projectMemberEntity = ProjectMemberEntity.builder()
			.id(projectMemberId)
			.isApproved(true)
			.role(ProjectMemberRole.OWNER)
			.build();

		projectMemberRepository.save(projectMemberEntity);

		return new ProjectCreateResponse(project.getId(),
			project.getProjectName());
	}
}
