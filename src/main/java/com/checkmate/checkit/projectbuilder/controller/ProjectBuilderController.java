package com.checkmate.checkit.projectbuilder.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.exception.CommonException;
import com.checkmate.checkit.global.response.JSONResponse;
import com.checkmate.checkit.projectbuilder.service.ProjectBuilderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * [ProjectBuilderController]
 * 프로젝트 전체 자동 빌드 (Spring Initializr 다운로드 + 코드 생성 + 디렉터리 저장) 담당 컨트롤러
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/project-builder")
public class ProjectBuilderController {

	private final ProjectBuilderService projectBuilderService;

	/**
	 * POST /api/project-builder/build/{projectId}
	 * 프로젝트 ID를 기반으로 전체 Spring 프로젝트 생성 실행
	 */
	@PostMapping("/build/{projectId}")
	public ResponseEntity<JSONResponse<Void>> buildProject(@PathVariable Integer projectId) {
		try {
			projectBuilderService.buildProject(projectId);
			return ResponseEntity.ok(JSONResponse.onSuccess(null));
		} catch (CommonException e) {
			log.error("[Error] 프로젝트 빌드 실패 - {}", e.getMessage());
			return ResponseEntity
				.status(e.getErrorCode().getHttpStatus()) // 🔁 여기 수정
				.body(JSONResponse.onFailure(e.getErrorCode()));
		} catch (Exception e) {
			log.error("[Error] 서버 내부 오류", e);
			return ResponseEntity.internalServerError().body(JSONResponse.onFailure(ErrorCode.SERVER_ERROR));
		}
	}
}
