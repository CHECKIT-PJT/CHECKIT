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

import com.checkmate.checkit.springsettings.entity.SpringSettingsEntity;
import com.checkmate.checkit.springsettings.service.SpringSettingsService;

@RestController
@RequestMapping("/api/config")
public class SpringSettingsController {

	@Autowired
	private SpringSettingsService springSettingsService;

	// SpringSettings 생성
	@PostMapping("/{projectId}")
	public ResponseEntity<SpringSettingsEntity> createSpringSettings(
		@PathVariable Integer projectId, @RequestBody SpringSettingsEntity springSettings) {

		SpringSettingsEntity createdSettings = springSettingsService.createSpringSettings(projectId, springSettings);
		return ResponseEntity.status(201).body(createdSettings); // 상태코드 201 생성 성공
	}

	// SpringSettings 조회
	@GetMapping("/{projectId}")
	public ResponseEntity<SpringSettingsEntity> getSpringSettings(@PathVariable Integer projectId) {

		SpringSettingsEntity settings = springSettingsService.getSpringSettings(projectId);
		return ResponseEntity.ok(settings); // 상태코드 200 조회 성공
	}

	// SpringSettings 수정
	@PutMapping("/{projectId}")
	public ResponseEntity<SpringSettingsEntity> updateSpringSettings(
		@PathVariable Integer projectId, @RequestBody SpringSettingsEntity springSettings) {

		SpringSettingsEntity updatedSettings = springSettingsService.updateSpringSettings(projectId, springSettings);
		return ResponseEntity.ok(updatedSettings); // 상태코드 200 수정 성공
	}

	// SpringSettings 삭제
	@DeleteMapping("/{projectId}")
	public ResponseEntity<Void> deleteSpringSettings(@PathVariable Integer projectId) {

		springSettingsService.deleteSpringSettings(projectId);
		return ResponseEntity.noContent().build(); // 상태코드 204 삭제 성공
	}
}
