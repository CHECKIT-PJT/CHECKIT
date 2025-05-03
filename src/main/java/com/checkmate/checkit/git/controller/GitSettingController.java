package com.checkmate.checkit.git.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.checkmate.checkit.git.dto.request.GitIgnoreCreateRequest;
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
}
