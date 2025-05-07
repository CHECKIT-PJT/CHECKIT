package com.checkmate.checkit.project.service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.common.mail.MailService;
import com.checkmate.checkit.global.config.JwtTokenProvider;
import com.checkmate.checkit.global.exception.CommonException;
import com.checkmate.checkit.project.dto.request.DockerComposeCreateRequest;
import com.checkmate.checkit.project.dto.request.DockerComposeUpdateRequest;
import com.checkmate.checkit.project.dto.request.ProjectCreateRequest;
import com.checkmate.checkit.project.dto.request.ProjectInvitationAcceptRequest;
import com.checkmate.checkit.project.dto.request.ProjectParticipateRequest;
import com.checkmate.checkit.project.dto.request.ProjectUpdateRequest;
import com.checkmate.checkit.project.dto.response.DockerComposeResponse;
import com.checkmate.checkit.project.dto.response.InvitationLinkCreateResponse;
import com.checkmate.checkit.project.dto.response.ProjectCreateResponse;
import com.checkmate.checkit.project.dto.response.ProjectDetailResponse;
import com.checkmate.checkit.project.dto.response.ProjectListResponse;
import com.checkmate.checkit.project.dto.response.ProjectMemberListResponse;
import com.checkmate.checkit.project.dto.response.ProjectMemberResponse;
import com.checkmate.checkit.project.entity.ProjectEntity;
import com.checkmate.checkit.project.entity.ProjectMemberEntity;
import com.checkmate.checkit.project.entity.ProjectMemberId;
import com.checkmate.checkit.project.entity.ProjectMemberRole;
import com.checkmate.checkit.project.repository.ProjectMemberRepository;
import com.checkmate.checkit.project.repository.ProjectRepository;
import com.checkmate.checkit.user.entity.User;
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
	private final MailService mailService;
	private final RedisTemplate<String, Object> redisTemplate;
	private final DockerComposeService dockerComposeService;

	private final String PROJECT_INVITE_URL = "http://localhost:5173/invite";

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
				return new ProjectListResponse(project.getId(), project.getProjectName(),
					project.getCreatedAt().toString());
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
				User user = userRepository.findById(memberId)
					.orElseThrow(() -> new CommonException(ErrorCode.USER_NOT_FOUND));
				return new ProjectMemberResponse(memberId, user.getUserName(), user.getNickname(),
					projectMember.getRole());
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
	public List<ProjectMemberListResponse> getProjectMembers(String token, Integer projectId) {

		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// 현재 로그인한 사용자가 프로젝트 소속인지 확인
		if (!projectMemberRepository.existsById_UserIdAndId_ProjectIdAndIsApprovedTrueAndIsDeletedFalse(
			loginUserId, projectId)) {
			throw new CommonException(ErrorCode.UNAUTHORIZED_PROJECT_ACCESS);
		}

		// 프로젝트 멤버 조회 (승인되지 않은 멤버 포함)
		List<ProjectMemberEntity> projectMembers = projectMemberRepository.findById_ProjectIdAndIsDeletedFalse(
			projectId);

		return projectMembers.stream()
			.map(projectMember -> {
				Integer memberId = projectMember.getId().getUserId();
				User user = userRepository.findById(memberId)
					.orElseThrow(() -> new CommonException(ErrorCode.USER_NOT_FOUND));
				return new ProjectMemberListResponse(memberId, user.getUserName(), user.getNickname(),
					projectMember.getRole(),
					projectMember.isApproved());
			})
			.toList();
	}

	/**
	 * 프로젝트 멤버 초대
	 * @param token : JWT 토큰
	 * @param projectId : 프로젝트 ID
	 * @param emails : 초대할 이메일 리스트
	 */
	@Transactional(readOnly = true)
	public void inviteProjectMember(String token, Integer projectId, List<String> emails) {

		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		validateUserAndProject(loginUserId, projectId);

		String inviteCode = UUID.randomUUID().toString();
		String key = "invite:" + inviteCode;
		redisTemplate.opsForValue().set(key, Integer.toString(projectId), 30, TimeUnit.MINUTES);

		// 이메일로 초대 코드 전송
		for (String email : emails) {
			mailService.sendInviteEmail(email,
				PROJECT_INVITE_URL + "?inviteCode=" + inviteCode);
		}

	}

	/**
	 * 프로젝트 초대 링크 생성
	 * @param token : JWT 토큰
	 * @param projectId : 프로젝트 ID
	 * @return invitationLinkCreateResponse : 초대 링크 생성 응답 DTO
	 */
	@Transactional(readOnly = true)
	public InvitationLinkCreateResponse createProjectInvitationLink(String token, Integer projectId) {

		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		validateUserAndProject(loginUserId, projectId);

		String inviteCode = UUID.randomUUID().toString();
		String key = "invite:" + inviteCode;
		redisTemplate.opsForValue().set(key, Integer.toString(projectId), 30, TimeUnit.MINUTES);

		return new InvitationLinkCreateResponse(PROJECT_INVITE_URL + "?inviteCode=" + inviteCode);
	}

	/**
	 * 프로젝트 참여 요청
	 * @param token : JWT 토큰
	 * @param projectId : 프로젝트 ID
	 */
	@Transactional
	public void requestProjectParticipation(String token, Integer projectId,
		ProjectParticipateRequest projectParticipateRequest) {

		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// 현재 로그인한 사용자가 프로젝트 소속인지 확인
		if (projectMemberRepository.existsById_UserIdAndId_ProjectIdAndIsApprovedTrueAndIsDeletedFalse(
			loginUserId, projectId)) {
			throw new CommonException(ErrorCode.ALREADY_MEMBER);
		}

		// 초대 코드로 프로젝트 ID 조회
		String key = "invite:" + projectParticipateRequest.inviteCode();
		String projectIdString = (String)redisTemplate.opsForValue().get(key);

		if (projectIdString == null) {
			throw new CommonException(ErrorCode.INVALID_INVITE_CODE);
		}

		// 프로젝트 ID와 회원 ID로 ProjectMemberId 생성
		Integer projectIdFromRedis = Integer.parseInt(projectIdString);

		ProjectMemberId projectMemberId = new ProjectMemberId(loginUserId, projectIdFromRedis);

		// 프로젝트 멤버 엔티티 생성
		ProjectMemberEntity projectMemberEntity = ProjectMemberEntity.builder()
			.id(projectMemberId)
			.isApproved(false)
			.role(ProjectMemberRole.MEMBER)
			.build();

		// 프로젝트 멤버 저장
		projectMemberRepository.save(projectMemberEntity);
	}

	/**
	 * 프로젝트 초대 승인
	 * @param token : JWT 토큰
	 * @param projectId : 프로젝트 ID
	 * @param projectInvitationAcceptRequest : 프로젝트 초대 승인 요청 DTO
	 */
	@Transactional
	public void approveProjectInvitation(String token, Integer projectId,
		ProjectInvitationAcceptRequest projectInvitationAcceptRequest) {

		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// 현재 로그인한 사용자가 프로젝트 소속인지 확인
		validateUserAndProject(loginUserId, projectId);

		// 회원 ID와 프로젝트 ID로 ProjectMemberEntity 조회
		ProjectMemberEntity projectMember = projectMemberRepository
			.findById_UserIdAndId_ProjectIdAndIsApprovedFalseAndIsDeletedFalse(
				projectInvitationAcceptRequest.userId(), projectId)
			.orElseThrow(() -> new CommonException(ErrorCode.INVALID_INVITE_MEMBER));

		// 프로젝트 멤버 승인
		projectMember.approve();
	}

	/**
	 * Docker Compose 생성
	 * @param token : JWT 토큰
	 * @param projectId : 프로젝트 ID
	 * @param dockerComposeCreateRequest : Docker Compose 생성 요청 DTO
	 */
	@Transactional
	public void createDockerCompose(String token, Integer projectId,
		DockerComposeCreateRequest dockerComposeCreateRequest) {

		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// 현재 로그인한 사용자가 프로젝트 소속인지 확인
		validateUserAndProject(loginUserId, projectId);

		// Docker Compose 생성 로직 구현
		dockerComposeService.generateAndSaveDockerComposeFile(projectId,
			dockerComposeCreateRequest);
	}

	/**
	 * Docker Compose 조회
	 * @param token : JWT 토큰
	 * @param projectId : 프로젝트 ID
	 * @return dockerComposeResponse : Docker Compose 응답 DTO
	 */
	@Transactional(readOnly = true)
	public DockerComposeResponse getDockerCompose(String token, Integer projectId) {
		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// 현재 로그인한 사용자가 프로젝트 소속인지 확인
		validateUserAndProject(loginUserId, projectId);

		// Docker Compose 조회
		return dockerComposeService.getDockerComposeFile(projectId);
	}

	/**
	 * Docker Compose 수정
	 * @param token : JWT 토큰
	 * @param projectId : 프로젝트 ID
	 * @param dockerComposeUpdateRequest : Docker Compose 수정 요청 DTO
	 */
	@Transactional
	public void updateDockerCompose(String token, Integer projectId,
		DockerComposeUpdateRequest dockerComposeUpdateRequest) {
		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// 현재 로그인한 사용자가 프로젝트 소속인지 확인
		validateUserAndProject(loginUserId, projectId);

		// Docker Compose 수정
		dockerComposeService.updateDockerComposeFile(projectId,
			dockerComposeUpdateRequest);
	}

	/**
	 * Docker Compose 삭제
	 * @param token : JWT 토큰
	 * @param projectId : 프로젝트 ID
	 */
	@Transactional
	public void deleteDockerCompose(String token, Integer projectId) {
		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// 현재 로그인한 사용자가 프로젝트 소속인지 확인
		validateUserAndProject(loginUserId, projectId);

		// Docker Compose 삭제
		dockerComposeService.deleteDockerComposeFile(projectId);
	}

	/**
	 * Docker Compose 파일 다운로드
	 * @param token : JWT 토큰
	 * @param projectId : 프로젝트 ID
	 * @return ByteArrayResource : Docker Compose 파일 리소스
	 */
	@Transactional(readOnly = true)
	public ByteArrayResource createDockerComposeFile(String token, Integer projectId) {
		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// 현재 로그인한 사용자가 프로젝트 소속인지 확인
		validateUserAndProject(loginUserId, projectId);

		// Docker Compose 파일 다운로드
		return dockerComposeService.createDockerComposeFile(projectId);
	}

	/**
	 * 프로젝트 소속 및 사용자 검증
	 * @param loginUserId : 로그인한 사용자 ID
	 * @param projectId : 프로젝트 ID
	 */
	@Transactional(readOnly = true)
	public void validateUserAndProject(Integer loginUserId, Integer projectId) {
		// 현재 로그인한 사용자가 프로젝트 소속인지 확인
		if (!projectMemberRepository.existsById_UserIdAndId_ProjectIdAndIsApprovedTrueAndIsDeletedFalse(
			loginUserId, projectId)) {
			throw new CommonException(ErrorCode.UNAUTHORIZED_PROJECT_ACCESS);
		}

		// 프로젝트 ID로 ProjectEntity 조회
		projectRepository.findByIdAndIsDeletedFalse(projectId)
			.orElseThrow(() -> new CommonException(ErrorCode.PROJECT_NOT_FOUND));
	}
}
