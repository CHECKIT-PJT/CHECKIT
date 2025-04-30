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
	public ResponseEntity<SpringSettingsDtoResponse> createSpringSettings(
		@PathVariable Integer projectId,
		@RequestBody SpringSettingsDtoRequest springSettingsRequest) {

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
		return ResponseEntity.status(201).body(response);
	}

	// SpringSettings 조회
	@GetMapping("/{projectId}")
	public ResponseEntity<SpringSettingsDtoResponse> getSpringSettings(@PathVariable Integer projectId) {
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
		return ResponseEntity.ok(response);
	}

	// SpringSettings 수정
	@PutMapping("/{projectId}")
	public ResponseEntity<SpringSettingsDtoResponse> updateSpringSettings(
		@PathVariable Integer projectId,
		@RequestBody SpringSettingsDtoRequest springSettingsRequest) {

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
		return ResponseEntity.ok(response);
	}

	// SpringSettings 삭제
	@DeleteMapping("/{projectId}")
	public ResponseEntity<Void> deleteSpringSettings(@PathVariable Integer projectId) {
		springSettingsService.deleteSpringSettings(projectId);
		return ResponseEntity.noContent().build(); // 상태코드 204 삭제 성공
	}
}
