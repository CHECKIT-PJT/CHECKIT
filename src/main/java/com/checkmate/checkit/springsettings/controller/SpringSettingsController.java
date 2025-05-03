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
import com.checkmate.checkit.springsettings.service.SpringSettingsService;

@RestController
@RequestMapping("/api/config")
public class SpringSettingsController {

	@Autowired
	private SpringSettingsService springSettingsService;

	@PostMapping("/{projectId}")
	public ResponseEntity<JSONResponse<SpringSettingsDtoResponse>> createSpringSettings(
		@PathVariable Integer projectId,
		@RequestBody SpringSettingsDtoRequest request) {
		try {
			SpringSettingsDtoResponse response = springSettingsService.createSpringSettings(projectId, request);
			return ResponseEntity.status(201).body(JSONResponse.onSuccess(response));
		} catch (RuntimeException e) {
			return ResponseEntity.status(400).body(JSONResponse.onFailure(ErrorCode.INVALID_REQUEST));
		}
	}

	@GetMapping("/{projectId}")
	public ResponseEntity<JSONResponse<SpringSettingsDtoResponse>> getSpringSettings(@PathVariable Integer projectId) {
		try {
			SpringSettingsDtoResponse response = springSettingsService.getSpringSettings(projectId);
			return ResponseEntity.ok(JSONResponse.onSuccess(response));
		} catch (RuntimeException e) {
			return ResponseEntity.status(404).body(JSONResponse.onFailure(ErrorCode.NOT_FOUND_ENDPOINT));
		}
	}

	@PutMapping("/{projectId}")
	public ResponseEntity<JSONResponse<SpringSettingsDtoResponse>> updateSpringSettings(
		@PathVariable Integer projectId,
		@RequestBody SpringSettingsDtoRequest request) {
		try {
			SpringSettingsDtoResponse response = springSettingsService.updateSpringSettings(projectId, request);
			return ResponseEntity.ok(JSONResponse.onSuccess(response));
		} catch (RuntimeException e) {
			return ResponseEntity.status(404).body(JSONResponse.onFailure(ErrorCode.NOT_FOUND_ENDPOINT));
		}
	}

	@DeleteMapping("/{projectId}")
	public ResponseEntity<JSONResponse<Void>> deleteSpringSettings(@PathVariable Integer projectId) {
		try {
			springSettingsService.deleteSpringSettings(projectId);
			return ResponseEntity.noContent().build();
		} catch (RuntimeException e) {
			return ResponseEntity.status(404).body(JSONResponse.onFailure(ErrorCode.NOT_FOUND_ENDPOINT));
		}
	}
}
