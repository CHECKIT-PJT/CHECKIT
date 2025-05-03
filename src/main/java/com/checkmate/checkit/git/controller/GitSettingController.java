package com.checkmate.checkit.git.controller;

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

import com.checkmate.checkit.git.dto.request.BranchStrategyCreateRequest;
import com.checkmate.checkit.git.dto.request.BranchStrategyUpdateRequest;
import com.checkmate.checkit.git.dto.request.GitIgnoreCreateRequest;
import com.checkmate.checkit.git.dto.response.BranchStrategyResponse;
import com.checkmate.checkit.git.dto.response.GitIgnoreResponse;
import com.checkmate.checkit.git.service.GitSettingService;
import com.checkmate.checkit.global.code.SuccessCode;
import com.checkmate.checkit.global.response.JSONResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/git")
@RequiredArgsConstructor
public class GitSettingController {

	private final GitSettingService gitSettingService;

	// GitIgnore 생성
	@PostMapping("/gitignore/{projectId}")
	public ResponseEntity<JSONResponse<Void>> createGitIgnore(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId,
		@RequestBody GitIgnoreCreateRequest request) {

		String token = authorization.substring(7);

		gitSettingService.createGitIgnore(token, projectId, request);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	// GitIgnore 조회
	@GetMapping("/gitignore/{projectId}")
	public ResponseEntity<JSONResponse<GitIgnoreResponse>> getGitIgnore(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId) {

		String token = authorization.substring(7);

		GitIgnoreResponse gitIgnoreResponse = gitSettingService.getGitIgnore(token, projectId);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, gitIgnoreResponse));
	}

	// GitIgnore 수정
	@PutMapping("/gitignore/{projectId}")
	public ResponseEntity<JSONResponse<Void>> updateGitIgnore(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId,
		@RequestBody GitIgnoreCreateRequest request) {

		String token = authorization.substring(7);

		gitSettingService.updateGitIgnore(token, projectId, request);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	// GitIgnore 삭제
	@DeleteMapping("/gitignore/{projectId}")
	public ResponseEntity<JSONResponse<Void>> deleteGitIgnore(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId) {

		String token = authorization.substring(7);

		gitSettingService.deleteGitIgnore(token, projectId);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	// 브랜치 전략 생성
	@PostMapping("/branch-strategy/{projectId}")
	public ResponseEntity<JSONResponse<Void>> createBranchStrategy(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId,
		@RequestBody BranchStrategyCreateRequest request) {

		String token = authorization.substring(7);

		gitSettingService.createBranchStrategy(token, projectId, request);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	// 브랜치 전략 조회
	@GetMapping("/branch-strategy/{projectId}")
	public ResponseEntity<JSONResponse<BranchStrategyResponse>> getBranchStrategy(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId) {

		String token = authorization.substring(7);

		BranchStrategyResponse branchStrategyResponse = gitSettingService.getBranchStrategy(token, projectId);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, branchStrategyResponse));
	}

	// 브랜치 전략 수정
	@PutMapping("/branch-strategy/{projectId}")
	public ResponseEntity<JSONResponse<Void>> updateBranchStrategy(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId,
		@RequestBody BranchStrategyUpdateRequest request) {

		String token = authorization.substring(7);

		gitSettingService.updateBranchStrategy(token, projectId, request);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	// 브랜치 전략 삭제
	@DeleteMapping("/branch-strategy/{projectId}")
	public ResponseEntity<JSONResponse<Void>> deleteBranchStrategy(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId) {

		String token = authorization.substring(7);

		gitSettingService.deleteBranchStrategy(token, projectId);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}
}
