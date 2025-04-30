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
import com.checkmate.checkit.springsettings.dto.SpringSettingsDtoRequest;
import com.checkmate.checkit.springsettings.dto.SpringSettingsDtoResponse;
import com.checkmate.checkit.springsettings.entity.SpringSettingsEntity;
import com.checkmate.checkit.springsettings.service.SpringSettingsService;

@RestController
@RequestMapping("/api/config")
public class SpringSettingsController {

	@Autowired
	private SpringSettingsService springSettingsService;

	// SpringSettings 생성
	@PostMapping("/{projectId}")
	public ResponseEntity<JSONResponse<SpringSettingsDtoResponse>> createSpringSettings(
		@PathVariable Integer projectId,
		@RequestBody SpringSettingsDtoRequest springSettingsRequest) {

		try {
			SpringSettingsEntity createdSettings = springSettingsService.createSpringSettings(projectId,
				springSettingsRequest);
			SpringSettingsDtoResponse response = new SpringSettingsDtoResponse(
				createdSettings.getId(),
				createdSettings.getSpringProject(),
				createdSettings.getSpringLanguage(),
				createdSettings.getSpringVersion(),
				createdSettings.getSpringGroup(),
				createdSettings.getSpringArtifact(),
				createdSettings.getSpringName(),
				createdSettings.getSpringDescription(),
				createdSettings.getSpringPackageName(),
				createdSettings.getSpringPackaging(),
				createdSettings.getSpringJavaVersion()
			);
			return ResponseEntity.status(201).body(JSONResponse.onSuccess(response));
		} catch (RuntimeException e) {
			return ResponseEntity.status(400).body(JSONResponse.onFailure(ErrorCode.INVALID_REQUEST));
		}
	}

	// SpringSettings 조회
	@GetMapping("/{projectId}")
	public ResponseEntity<JSONResponse<SpringSettingsDtoResponse>> getSpringSettings(@PathVariable Integer projectId) {
		try {
			SpringSettingsEntity settings = springSettingsService.getSpringSettings(projectId);
			SpringSettingsDtoResponse response = new SpringSettingsDtoResponse(
				settings.getId(),
				settings.getSpringProject(),
				settings.getSpringLanguage(),
				settings.getSpringVersion(),
				settings.getSpringGroup(),
				settings.getSpringArtifact(),
				settings.getSpringName(),
				settings.getSpringDescription(),
				settings.getSpringPackageName(),
				settings.getSpringPackaging(),
				settings.getSpringJavaVersion()
			);
			return ResponseEntity.ok(JSONResponse.onSuccess(response));
		} catch (RuntimeException e) {
			return ResponseEntity.status(404).body(JSONResponse.onFailure(ErrorCode.NOT_FOUND_ENDPOINT));
		}
	}

	// SpringSettings 수정
	@PutMapping("/{projectId}")
	public ResponseEntity<JSONResponse<SpringSettingsDtoResponse>> updateSpringSettings(
		@PathVariable Integer projectId,
		@RequestBody SpringSettingsDtoRequest springSettingsRequest) {

		try {
			SpringSettingsEntity updatedSettings = springSettingsService.updateSpringSettings(projectId,
				springSettingsRequest);
			SpringSettingsDtoResponse response = new SpringSettingsDtoResponse(
				updatedSettings.getId(),
				updatedSettings.getSpringProject(),
				updatedSettings.getSpringLanguage(),
				updatedSettings.getSpringVersion(),
				updatedSettings.getSpringGroup(),
				updatedSettings.getSpringArtifact(),
				updatedSettings.getSpringName(),
				updatedSettings.getSpringDescription(),
				updatedSettings.getSpringPackageName(),
				updatedSettings.getSpringPackaging(),
				updatedSettings.getSpringJavaVersion()
			);
			return ResponseEntity.ok(JSONResponse.onSuccess(response));
		} catch (RuntimeException e) {
			return ResponseEntity.status(404).body(JSONResponse.onFailure(ErrorCode.NOT_FOUND_ENDPOINT));
		}
	}

	// SpringSettings 삭제
	@DeleteMapping("/{projectId}")
	public ResponseEntity<JSONResponse<Void>> deleteSpringSettings(@PathVariable Integer projectId) {
		try {
			springSettingsService.deleteSpringSettings(projectId);
			return ResponseEntity.noContent().build();  // 상태코드 204 삭제 성공
		} catch (RuntimeException e) {
			return ResponseEntity.status(404).body(JSONResponse.onFailure(ErrorCode.NOT_FOUND_ENDPOINT));
		}
	}
}
