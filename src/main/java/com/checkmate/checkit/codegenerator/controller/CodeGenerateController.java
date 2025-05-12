package com.checkmate.checkit.codegenerator.controller;

import java.io.IOException;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.checkmate.checkit.codegenerator.service.ControllerGenerateService;
import com.checkmate.checkit.codegenerator.service.DtoGenerateService;
import com.checkmate.checkit.codegenerator.service.EntityGenerateService;
import com.checkmate.checkit.codegenerator.service.RepositoryGenerateService;
import com.checkmate.checkit.codegenerator.service.ServiceGenerateService;
import com.checkmate.checkit.erd.dto.response.ErdSnapshotResponse;
import com.checkmate.checkit.erd.service.ErdService;
import com.checkmate.checkit.springsettings.service.SpringSettingsService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/generate")
@RequiredArgsConstructor
public class CodeGenerateController {

	private final EntityGenerateService entityGenerateService;
	private final ErdService erdService;
	private final SpringSettingsService springSettingsService;
	private final DtoGenerateService dtoGenerateService;
	private final ServiceGenerateService serviceGenerateService;
	private final RepositoryGenerateService repositoryGenerateService;
	private final ControllerGenerateService controllerGenerateService;

	/**
	 * 프로젝트 ID 기반으로 전체 코드 생성 (Entity + DTO + Service + Repository)
	 */
	@PostMapping("/build/{projectId}")
	public ResponseEntity<String> generateEntityCode(@PathVariable int projectId) throws IOException {
		// 1. SpringSettings에서 basePackage 조회
		String basePackage = Optional.ofNullable(
			springSettingsService.getSpringSettings(projectId).getSpringPackageName()
		).orElseThrow(() -> new IllegalStateException("springPackageName이 null입니다. Spring 설정을 확인하세요."));

		// 2. ERD JSON 가져오기
		ErdSnapshotResponse erdData = erdService.getErdByProjectId(projectId);
		String erdJson = erdData.getErdJson();

		// 전체 코드 결과
		StringBuilder codeResult = new StringBuilder();

		// 3. Entity 코드 생성
		codeResult.append(entityGenerateService.generateEntitiesFromErdJson(erdJson, basePackage)).append("\n");

		// 4. DTO 코드 생성
		dtoGenerateService.generateDtos(projectId, basePackage).forEach((fileName, content) -> {
			codeResult.append(content).append("\n");
		});

		// 5. Query DTO 코드 생성
		dtoGenerateService.generateQueryDtos(projectId).forEach((fileName, content) -> {
			codeResult.append(content).append("\n");
		});

		// 6. Service 코드 생성
		serviceGenerateService.generateServiceCodeByCategory(projectId, basePackage)
			.forEach((category, content) -> codeResult.append(content).append("\n"));

		// 7. Repository 코드 생성
		codeResult.append(repositoryGenerateService.generateRepositoriesFromErdJson(erdJson, basePackage)).append("\n");

		// 8. Controller 코드 생성 ← 추가됨
		controllerGenerateService.generateControllersByCategory(projectId, basePackage)
			.forEach((fileName, content) -> codeResult.append(content).append("\n"));

		// 최종 코드 반환
		return ResponseEntity.ok(codeResult.toString());
	}
}
