package com.checkmate.checkit.project.controller;

import java.util.List;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.checkmate.checkit.global.code.SuccessCode;
import com.checkmate.checkit.global.response.JSONResponse;
import com.checkmate.checkit.project.dto.request.DockerComposeCreateRequest;
import com.checkmate.checkit.project.dto.request.DockerComposeUpdateRequest;
import com.checkmate.checkit.project.dto.request.JiraProjectUpdateRequest;
import com.checkmate.checkit.project.dto.request.ProjectCreateRequest;
import com.checkmate.checkit.project.dto.request.ProjectInvitationAcceptRequest;
import com.checkmate.checkit.project.dto.request.ProjectParticipateRequest;
import com.checkmate.checkit.project.dto.request.ProjectUpdateRequest;
import com.checkmate.checkit.project.dto.request.ReadmeUpdateRequest;
import com.checkmate.checkit.project.dto.request.SequenceDiagramUpdateRequest;
import com.checkmate.checkit.project.dto.response.DockerComposeResponse;
import com.checkmate.checkit.project.dto.response.InvitationLinkCreateResponse;
import com.checkmate.checkit.project.dto.response.JiraLinkResponse;
import com.checkmate.checkit.project.dto.response.ProjectCreateResponse;
import com.checkmate.checkit.project.dto.response.ProjectDetailResponse;
import com.checkmate.checkit.project.dto.response.ProjectJiraResponse;
import com.checkmate.checkit.project.dto.response.ProjectListResponse;
import com.checkmate.checkit.project.dto.response.ProjectMemberResponse;
import com.checkmate.checkit.project.dto.response.ReadmeResponse;
import com.checkmate.checkit.project.dto.response.SequenceDiagramResponse;
import com.checkmate.checkit.project.service.JiraProjectService;
import com.checkmate.checkit.project.service.ProjectService;
import com.checkmate.checkit.project.service.ReadmeService;
import com.checkmate.checkit.project.service.SequenceDiagramService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/project")
@RequiredArgsConstructor
public class ProjectController {

	private final ProjectService projectService;
	private final ReadmeService readmeService;
	private final SequenceDiagramService sequenceDiagramService;
	private final JiraProjectService jiraProjectService;

	// 새 프로젝트 생성
	@PostMapping
	public ResponseEntity<JSONResponse<ProjectCreateResponse>> createProject(
		@RequestHeader("Authorization") String authorization,
		@RequestBody ProjectCreateRequest projectCreateRequest) {

		String token = authorization.substring(7);

		ProjectCreateResponse projectCreateResponse = projectService.createProject(token, projectCreateRequest);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, projectCreateResponse));
	}

	// 프로젝트 목록 조회
	@GetMapping
	public ResponseEntity<JSONResponse<List<ProjectListResponse>>> getProjectList(
		@RequestHeader("Authorization") String authorization) {

		String token = authorization.substring(7);

		List<ProjectListResponse> projectListResponse = projectService.getProjectList(token);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, projectListResponse));
	}

	// 프로젝트 상세 조회
	@GetMapping("/{projectId}")
	public ResponseEntity<JSONResponse<ProjectDetailResponse>> getProjectDetail(
		@RequestHeader("Authorization") String authorization, @PathVariable Integer projectId) {

		String token = authorization.substring(7);

		ProjectDetailResponse projectDetailResponse = projectService.getProjectDetail(token, projectId);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, projectDetailResponse));
	}

	// 프로젝트 정보 수정
	@PutMapping("/{projectId}")
	public ResponseEntity<JSONResponse<Void>> updateProject(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId,
		@RequestBody ProjectUpdateRequest projectUpdateRequest) {

		String token = authorization.substring(7);

		projectService.updateProject(token, projectId, projectUpdateRequest);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	// 프로젝트 탈퇴
	@DeleteMapping("/{projectId}/leave")
	public ResponseEntity<JSONResponse<Void>> leaveProject(
		@RequestHeader("Authorization") String authorization, @PathVariable Integer projectId) {

		String token = authorization.substring(7);

		projectService.leaveProject(token, projectId);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	// 프로젝트 삭제
	@DeleteMapping("/{projectId}")
	public ResponseEntity<JSONResponse<Void>> deleteProject(
		@RequestHeader("Authorization") String authorization, @PathVariable Integer projectId) {

		String token = authorization.substring(7);

		projectService.deleteProject(token, projectId);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	// 프로젝트 멤버 목록 조회
	@GetMapping("/{projectId}/members")
	public ResponseEntity<JSONResponse<List<ProjectMemberResponse>>> getProjectMembers(
		@RequestHeader("Authorization") String authorization, @PathVariable Integer projectId) {

		String token = authorization.substring(7);

		List<ProjectMemberResponse> projectMembers = projectService.getProjectMembers(token, projectId);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, projectMembers));
	}

	// 프로젝트 멤버 이메일로 초대
	@PostMapping("/{projectId}/invitations")
	public ResponseEntity<JSONResponse<Void>> inviteProjectMember(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId,
		@RequestBody List<String> emails) {

		String token = authorization.substring(7);

		projectService.inviteProjectMember(token, projectId, emails);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	// 프로젝트 초대 링크 생성
	@PostMapping("/{projectId}/invitations/link")
	public ResponseEntity<JSONResponse<InvitationLinkCreateResponse>> createProjectInvitationLink(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId) {

		String token = authorization.substring(7);

		InvitationLinkCreateResponse invitationLinkCreateResponse = projectService.createProjectInvitationLink(token,
			projectId);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, invitationLinkCreateResponse));
	}

	// 프로젝트 참여 요청
	@PostMapping("/participation")
	public ResponseEntity<JSONResponse<Void>> requestProjectParticipation(
		@RequestHeader("Authorization") String authorization,
		@RequestBody ProjectParticipateRequest projectParticipateRequest
	) {

		String token = authorization.substring(7);

		projectService.requestProjectParticipation(token, projectParticipateRequest);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	// 프로젝트 초대 승인
	@PostMapping("{projectId}/invitations/accept")
	public ResponseEntity<JSONResponse<Void>> approveProjectInvitation(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId,
		@RequestBody ProjectInvitationAcceptRequest projectInvitationAcceptRequest) {

		String token = authorization.substring(7);

		projectService.approveProjectInvitation(token, projectId, projectInvitationAcceptRequest);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	// docker-compose 파일 생성
	@PostMapping("/{projectId}/docker-compose")
	public ResponseEntity<JSONResponse<Void>> createDockerCompose(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId,
		@RequestBody DockerComposeCreateRequest dockerComposeCreateRequest) {

		String token = authorization.substring(7);

		projectService.createDockerCompose(token, projectId, dockerComposeCreateRequest);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	// docker-compose 파일 조회
	@GetMapping("/{projectId}/docker-compose")
	public ResponseEntity<JSONResponse<DockerComposeResponse>> getDockerCompose(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId) {

		String token = authorization.substring(7);

		DockerComposeResponse dockerComposeContent = projectService.getDockerCompose(token, projectId);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, dockerComposeContent));
	}

	// docker-compose 파일 수정
	@PutMapping("/{projectId}/docker-compose")
	public ResponseEntity<JSONResponse<Void>> updateDockerCompose(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId,
		@RequestBody DockerComposeUpdateRequest dockerComposeUpdateRequest) {

		String token = authorization.substring(7);

		projectService.updateDockerCompose(token, projectId, dockerComposeUpdateRequest);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	// docker-compose 파일 삭제
	@DeleteMapping("/{projectId}/docker-compose")
	public ResponseEntity<JSONResponse<Void>> deleteDockerCompose(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId) {

		String token = authorization.substring(7);

		projectService.deleteDockerCompose(token, projectId);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	// docker-compose 파일 다운로드
	@GetMapping("/{projectId}/docker-compose/download")
	public ResponseEntity<Resource> downloadDockerCompose(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId) {

		String token = authorization.substring(7);

		ByteArrayResource dockerComposeFile = projectService.createDockerComposeFile(token, projectId);

		return ResponseEntity.ok()
			.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=docker-compose.yml")
			.contentType(MediaType.parseMediaType("application/x-yaml"))
			.body(dockerComposeFile);
	}

	// readme 조회
	@GetMapping("/{projectId}/readme")
	public ResponseEntity<JSONResponse<ReadmeResponse>> getReadme(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId) {

		String token = authorization.substring(7);

		ReadmeResponse readmeResponse = readmeService.getReadme(token, projectId);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, readmeResponse));
	}

	// readme 수정
	@PutMapping("/{projectId}/readme")
	public ResponseEntity<JSONResponse<Void>> updateReadme(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId,
		@RequestBody ReadmeUpdateRequest readmeUpdateRequest) {

		String token = authorization.substring(7);

		readmeService.updateReadme(token, projectId, readmeUpdateRequest);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	// readme 삭제
	@DeleteMapping("/{projectId}/readme")
	public ResponseEntity<JSONResponse<Void>> deleteReadme(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId) {

		String token = authorization.substring(7);

		readmeService.deleteReadme(token, projectId);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	// 시퀀스 다이어그램 조회
	@GetMapping("/{projectId}/sequence")
	public ResponseEntity<JSONResponse<SequenceDiagramResponse>> getSequenceDiagram(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId) {

		String token = authorization.substring(7);

		SequenceDiagramResponse sequenceDiagramResponse = sequenceDiagramService.getSequenceDiagram(token, projectId);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, sequenceDiagramResponse));
	}

	// 시퀀스 다이어그램 수정
	@PutMapping("/{projectId}/sequence")
	public ResponseEntity<JSONResponse<Void>> updateSequenceDiagram(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId,
		@RequestBody SequenceDiagramUpdateRequest sequenceDiagramUpdateRequest) {

		String token = authorization.substring(7);

		sequenceDiagramService.updateSequenceDiagram(token, projectId, sequenceDiagramUpdateRequest);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	// 시퀀스 다이어그램 삭제
	@DeleteMapping("/{projectId}/sequence")
	public ResponseEntity<JSONResponse<Void>> deleteSequenceDiagram(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId) {

		String token = authorization.substring(7);

		sequenceDiagramService.deleteSequenceDiagram(token, projectId);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	// 프로젝트 Jira 등록
	@PutMapping("/{projectId}/jira")
	public ResponseEntity<JSONResponse<Void>> registerJira(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId,
		@RequestBody JiraProjectUpdateRequest jiraProjectUpdateRequest) {

		String token = authorization.substring(7);

		jiraProjectService.registerJira(token, projectId, jiraProjectUpdateRequest);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	// 프로젝트에 등록된 Jira 정보 조회
	@GetMapping("/{projectId}/jira")
	public ResponseEntity<JSONResponse<ProjectJiraResponse>> getJiraInfo(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId) {

		String token = authorization.substring(7);

		ProjectJiraResponse projectJiraResponse = jiraProjectService.getJiraInfo(token, projectId);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, projectJiraResponse));
	}

	// Jira에 Issue 등록
	@PostMapping("/{projectId}/jira/issues")
	public ResponseEntity<JSONResponse<JiraLinkResponse>> createJiraIssue(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId
	) {

		String token = authorization.substring(7);

		JiraLinkResponse jiraLinkResponse = jiraProjectService.createJiraIssues(token, projectId);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, jiraLinkResponse));
	}
}
