package com.checkmate.checkit.project.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.config.JwtTokenProvider;
import com.checkmate.checkit.global.exception.CommonException;
import com.checkmate.checkit.project.dto.request.ProjectCreateRequest;
import com.checkmate.checkit.project.dto.request.ProjectUpdateRequest;
import com.checkmate.checkit.project.dto.response.ProjectCreateResponse;
import com.checkmate.checkit.project.dto.response.ProjectDetailResponse;
import com.checkmate.checkit.project.dto.response.ProjectListResponse;
import com.checkmate.checkit.project.dto.response.ProjectMemberResponse;
import com.checkmate.checkit.project.entity.ProjectEntity;
import com.checkmate.checkit.project.entity.ProjectMemberEntity;
import com.checkmate.checkit.project.entity.ProjectMemberId;
import com.checkmate.checkit.project.entity.ProjectMemberRole;
import com.checkmate.checkit.project.repository.ProjectMemberRepository;
import com.checkmate.checkit.project.repository.ProjectRepository;
import com.checkmate.checkit.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectService {

	private final ProjectRepository projectRepository;
	private final ProjectMemberRepository projectMemberRepository;
	private final JwtTokenProvider jwtTokenProvider;
	private final UserRepository userRepository;

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
		ProjectMemberId projectMemberId = new ProjectMemberId(loginUserId, project.getId());
		ProjectMemberEntity projectMemberEntity = ProjectMemberEntity.builder()
			.id(projectMemberId)
			.isApproved(true)
			.role(ProjectMemberRole.OWNER)
			.build();

		projectMemberRepository.save(projectMemberEntity);

		return new ProjectCreateResponse(project.getId(),
			project.getProjectName());
	}

	/**
	 * 프로젝트 목록 조회
	 * @param token : JWT 토큰
	 * @return projectListResponse : 프로젝트 목록 응답 DTO
	 */
	@Transactional(readOnly = true)
	public List<ProjectListResponse> getProjectList(String token) {

		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		List<ProjectMemberEntity> projectMembers = projectMemberRepository.findById_UserIdAndIsApprovedTrueAndIsDeletedFalse(
			loginUserId);

		// ProjectMember 목록에서 프로젝트 ID 추출
		return projectMembers.stream()
			.map(projectMember -> {
				// 프로젝트 ID로 ProjectEntity 조회
				ProjectEntity project = projectRepository.findByIdAndIsDeletedFalse(
						projectMember.getId().getProjectId())
					.orElseThrow(() -> new CommonException(ErrorCode.PROJECT_NOT_FOUND));
				return new ProjectListResponse(project.getId(), project.getProjectName());
			})
			.toList();
	}

	/**
	 * 프로젝트 상세 조회
	 * @param token : JWT 토큰
	 * @param projectId : 프로젝트 ID
	 * @return projectDetailResponse : 프로젝트 상세 응답 DTO
	 */
	@Transactional(readOnly = true)
	public ProjectDetailResponse getProjectDetail(String token, Integer projectId) {

		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// 현재 로그인한 사용자가 프로젝트 소속인지 확인
		if (!projectMemberRepository.existsById_UserIdAndId_ProjectIdAndIsApprovedTrueAndIsDeletedFalse(
			loginUserId, projectId)) {
			throw new CommonException(ErrorCode.UNAUTHORIZED_PROJECT_ACCESS);
		}

		// 프로젝트 ID로 ProjectEntity 조회
		ProjectEntity project = projectRepository.findByIdAndIsDeletedFalse(projectId)
			.orElseThrow(() -> new CommonException(ErrorCode.PROJECT_NOT_FOUND));

		// 프로젝트 멤버 조회
		List<ProjectMemberEntity> projectMembers = projectMemberRepository.findById_ProjectIdAndIsApprovedTrueAndIsDeletedFalse(
			projectId);

		// ProjectMember 목록에서 멤버 ID와 역할 추출
		List<ProjectMemberResponse> memberResponses = projectMembers.stream()
			.map(projectMember -> {
				Integer memberId = projectMember.getId().getUserId();
				String memberName = userRepository.findById(memberId)
					.orElseThrow(() -> new CommonException(ErrorCode.USER_NOT_FOUND))
					.getUserName();
				return new ProjectMemberResponse(memberId, memberName, projectMember.getRole());
			})
			.toList();

		return new ProjectDetailResponse(project.getId(), project.getProjectName(), memberResponses,
			project.getCreatedAt().toString(),
			project.getUpdatedAt().toString());
	}

	/**
	 * 프로젝트 정보 수정
	 * @param token : JWT 토큰
	 * @param projectId : 프로젝트 ID
	 * @param projectUpdateRequest : 프로젝트 수정 요청 DTO
	 */
	@Transactional
	public void updateProject(String token, Integer projectId, ProjectUpdateRequest projectUpdateRequest) {

		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// 현재 로그인한 사용자가 프로젝트 소속인지 확인
		if (!projectMemberRepository.existsById_UserIdAndId_ProjectIdAndIsApprovedTrueAndIsDeletedFalse(
			loginUserId, projectId)) {
			throw new CommonException(ErrorCode.UNAUTHORIZED_PROJECT_ACCESS);
		}

		// 프로젝트 ID로 ProjectEntity 조회
		ProjectEntity project = projectRepository.findByIdAndIsDeletedFalse(projectId)
			.orElseThrow(() -> new CommonException(ErrorCode.PROJECT_NOT_FOUND));

		// 프로젝트 이름 수정
		project.updateProjectName(projectUpdateRequest.projectName());
	}

	/**
	 * 프로젝트 탈퇴
	 * @param token : JWT 토큰
	 * @param projectId : 프로젝트 ID
	 */
	@Transactional
	public void leaveProject(String token, Integer projectId) {

		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// 현재 로그인한 사용자가 프로젝트 소속인지 확인
		ProjectMemberEntity projectMember = projectMemberRepository.findById_UserIdAndId_ProjectIdAndIsApprovedTrueAndIsDeletedFalse(
				loginUserId, projectId)
			.orElseThrow(() -> new CommonException(ErrorCode.UNAUTHORIZED_PROJECT_ACCESS));

		// 프로젝트 소유주인 경우 예외 처리
		if (projectMember.getRole() == ProjectMemberRole.OWNER) {
			throw new CommonException(ErrorCode.CANNOT_LEAVE_PROJECT_OWNER);
		}

		// 프로젝트 멤버 탈퇴
		projectMember.delete();
	}

	/**
	 * 프로젝트 삭제
	 * @param token : JWT 토큰
	 * @param projectId : 프로젝트 ID
	 */
	@Transactional
	public void deleteProject(String token, Integer projectId) {

		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// 현재 로그인한 사용자가 프로젝트 소속인지 확인
		ProjectMemberEntity projectMember = projectMemberRepository.findById_UserIdAndId_ProjectIdAndIsApprovedTrueAndIsDeletedFalse(
				loginUserId, projectId)
			.orElseThrow(() -> new CommonException(ErrorCode.UNAUTHORIZED_PROJECT_ACCESS));

		// 프로젝트 소유주인지 확인
		if (projectMember.getRole() != ProjectMemberRole.OWNER) {
			throw new CommonException(ErrorCode.CANNOT_DELETE_PROJECT_MEMBER);
		}

		// 프로젝트에 소속된 멤버가 있는지 확인
		if (projectMemberRepository.existsById_ProjectIdAndRoleAndIsApprovedTrueAndIsDeletedFalse(projectId,
			ProjectMemberRole.MEMBER)) {
			throw new CommonException(ErrorCode.PROJECT_MEMBER_EXISTS);
		}

		// 프로젝트 삭제
		ProjectEntity project = projectRepository.findByIdAndIsDeletedFalse(projectId)
			.orElseThrow(() -> new CommonException(ErrorCode.PROJECT_NOT_FOUND));
		project.delete();
		projectMember.delete();
	}

	/**
	 * 프로젝트 멤버 조회
	 * @param token : JWT 토큰
	 * @param projectId : 프로젝트 ID
	 * @return projectMemberResponse : 프로젝트 멤버 응답 DTO
	 */
	@Transactional(readOnly = true)
	public List<ProjectMemberResponse> getProjectMembers(String token, Integer projectId) {

		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// 현재 로그인한 사용자가 프로젝트 소속인지 확인
		if (!projectMemberRepository.existsById_UserIdAndId_ProjectIdAndIsApprovedTrueAndIsDeletedFalse(
			loginUserId, projectId)) {
			throw new CommonException(ErrorCode.UNAUTHORIZED_PROJECT_ACCESS);
		}

		// 프로젝트 멤버 조회
		List<ProjectMemberEntity> projectMembers = projectMemberRepository.findById_ProjectIdAndIsApprovedTrueAndIsDeletedFalse(
			projectId);

		return projectMembers.stream()
			.map(projectMember -> {
				Integer memberId = projectMember.getId().getUserId();
				String memberName = userRepository.findById(memberId)
					.orElseThrow(() -> new CommonException(ErrorCode.USER_NOT_FOUND))
					.getUserName();
				return new ProjectMemberResponse(memberId, memberName, projectMember.getRole());
			})
			.toList();
	}
}
