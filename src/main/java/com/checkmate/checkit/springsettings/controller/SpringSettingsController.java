package com.checkmate.checkit.springsettings.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.response.JSONResponse;
import com.checkmate.checkit.springsettings.dto.DependenciesDtoRequest;
import com.checkmate.checkit.springsettings.dto.DependencyDtoResponse;
import com.checkmate.checkit.springsettings.dto.SpringSettingsDtoResponse;
import com.checkmate.checkit.springsettings.service.SpringSettingsService;

@RestController
@RequestMapping("/api/config")
public class SpringSettingsController {

	@Autowired
	private SpringSettingsService springSettingsService;

	/**
	 * POST /api/config/{projectId}
	 * 스프링 세팅 정보와 함께 선택된 의존성들을 저장하는 API
	 */
	@PostMapping("/{projectId}")
	public ResponseEntity<JSONResponse<SpringSettingsDtoResponse>> createSpringSettings(
		@PathVariable Integer projectId,
		@RequestBody DependenciesDtoRequest request) {
		try {
			SpringSettingsDtoResponse response = springSettingsService.createSpringSettings(projectId, request);
			return ResponseEntity.status(201).body(JSONResponse.onSuccess(response));
		} catch (RuntimeException e) {
			return ResponseEntity.status(400).body(JSONResponse.onFailure(ErrorCode.INVALID_REQUEST));
		}
	}

	/**
	 * GET /api/config/{projectId}
	 * 프로젝트 ID로 스프링 세팅 정보를 조회
	 */
	@GetMapping("/{projectId}")
	public ResponseEntity<JSONResponse<SpringSettingsDtoResponse>> getSpringSettings(@PathVariable Integer projectId) {
		try {
			SpringSettingsDtoResponse response = springSettingsService.getSpringSettings(projectId);
			return ResponseEntity.ok(JSONResponse.onSuccess(response));
		} catch (RuntimeException e) {
			return ResponseEntity.status(404).body(JSONResponse.onFailure(ErrorCode.NOT_FOUND_ENDPOINT));
		}
	}

	/**
	 * PUT /api/config/{projectId}
	 * 스프링 세팅 정보 및 의존성 수정
	 */
	@PutMapping("/{projectId}")
	public ResponseEntity<JSONResponse<SpringSettingsDtoResponse>> updateSpringSettings(
		@PathVariable Integer projectId,
		@RequestBody DependenciesDtoRequest request) {
		try {
			SpringSettingsDtoResponse response = springSettingsService.updateSpringSettings(projectId, request); // 재사용
			return ResponseEntity.ok(JSONResponse.onSuccess(response));
		} catch (RuntimeException e) {
			return ResponseEntity.status(404).body(JSONResponse.onFailure(ErrorCode.NOT_FOUND_ENDPOINT));
		}
	}

	/**
	 * DELETE /api/config/{projectId}
	 * 프로젝트의 스프링 세팅 및 의존성 정보 삭제
	 */
	@DeleteMapping("/{projectId}")
	public ResponseEntity<JSONResponse<Void>> deleteSpringSettings(@PathVariable Integer projectId) {
		try {
			springSettingsService.deleteSpringSettings(projectId);
			return ResponseEntity.noContent().build();
		} catch (RuntimeException e) {
			return ResponseEntity.status(404).body(JSONResponse.onFailure(ErrorCode.NOT_FOUND_ENDPOINT));
		}
	}

	@GetMapping("/dependencies")
	public ResponseEntity<JSONResponse<DependencyDtoResponse>> getAllDependencies() {
		try {
			DependencyDtoResponse response = springSettingsService.getAllDependencies();
			return ResponseEntity.ok(JSONResponse.onSuccess(response));
		} catch (RuntimeException e) {
			return ResponseEntity.status(500).body(JSONResponse.onFailure(ErrorCode.SERVER_ERROR));
		}
	}

}
