package com.checkmate.checkit.project.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.checkmate.checkit.global.code.SuccessCode;
import com.checkmate.checkit.global.response.JSONResponse;
import com.checkmate.checkit.project.dto.request.ProjectCreateRequest;
import com.checkmate.checkit.project.dto.response.ProjectCreateResponse;
import com.checkmate.checkit.project.dto.response.ProjectListResponse;
import com.checkmate.checkit.project.service.ProjectService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/project")
@RequiredArgsConstructor
public class ProjectController {

	private final ProjectService projectService;

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
}
