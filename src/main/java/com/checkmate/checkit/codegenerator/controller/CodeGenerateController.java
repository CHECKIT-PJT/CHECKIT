package com.checkmate.checkit.codegenerator.controller;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.checkmate.checkit.api.entity.ApiSpecEntity;
import com.checkmate.checkit.api.repository.ApiSpecRepository;
import com.checkmate.checkit.codegenerator.service.ControllerGenerateService;
import com.checkmate.checkit.codegenerator.service.DtoGenerateService;
import com.checkmate.checkit.codegenerator.service.EntityGenerateService;
import com.checkmate.checkit.codegenerator.service.RepositoryGenerateService;
import com.checkmate.checkit.codegenerator.service.ServiceGenerateService;
import com.checkmate.checkit.erd.dto.response.ErdSnapshotResponse;
import com.checkmate.checkit.erd.service.ErdService;
import com.checkmate.checkit.functional.repository.FunctionalSpecRepository;
import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.exception.CommonException;
import com.checkmate.checkit.project.service.DockerComposeService;
import com.checkmate.checkit.springsettings.entity.DependencyEntity;
import com.checkmate.checkit.springsettings.repository.DependencyRepository;
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
	private final FunctionalSpecRepository functionalSpecRepository;
	private final ApiSpecRepository apiSpecRepository;
	private final DependencyRepository dependencyRepository;
	private final DockerComposeService dockerComposeService;

	/**
	 * 프로젝트 ID 기반으로 전체 코드 생성 (Entity + DTO + Service + Repository + Controller) 및 에러 코드 발생
	 */
	@PostMapping("/build/{projectId}")
	public ResponseEntity<?> generateEntityCode(@PathVariable int projectId) {
		try {
			// 1. Spring 설정 확인
			String basePackage = Optional.ofNullable(
					springSettingsService.getSpringSettings(projectId).getSpringPackageName())
				.orElseThrow(() -> new CommonException(ErrorCode.SPRING_SETTINGS_NOT_FOUND));

			// 2. 기능 명세서 확인
			if (functionalSpecRepository.findByProjectIdAndIsDeletedFalse(projectId).isEmpty()) {
				throw new CommonException(ErrorCode.FUNCTIONAL_SPEC_NOT_FOUND);
			}

			// 3. ERD 확인
			ErdSnapshotResponse erdData = erdService.getErdByProjectId(projectId);
			if (erdData == null || erdData.getErdJson() == null || erdData.getErdJson().isBlank()) {
				throw new CommonException(ErrorCode.ERD_NOT_FOUND);
			}

			String erdJson = erdData.getErdJson();

			// 4. API 명세 확인
			List<ApiSpecEntity> apiSpecs = apiSpecRepository.findAllByProjectId_Id(projectId);
			if (apiSpecs.isEmpty()) {
				throw new CommonException(ErrorCode.API_SPEC_NOT_FOUND);
			}

			List<DependencyEntity> dependencies = dependencyRepository.findByProjectEntity_Id(projectId);

			// 5. 코드 생성
			StringBuilder codeResult = new StringBuilder();

			entityGenerateService.generateEntitiesFromErdJson(erdJson, basePackage)
				.forEach((fileName, content) -> codeResult.append(content).append("\n"));

			dtoGenerateService.generateDtos(projectId, basePackage)
				.forEach((fileName, content) -> codeResult.append(content).append("\n"));

			dtoGenerateService.generateQueryDtos(projectId, basePackage)
				.forEach((fileName, content) -> codeResult.append(content).append("\n"));

			serviceGenerateService.generateServiceCodeByCategory(projectId, basePackage)
				.forEach((fileName, content) -> codeResult.append(content).append("\n"));

			repositoryGenerateService.generateRepositoriesFromErdJson(erdJson, basePackage)
				.forEach((fileName, content) -> codeResult.append(content).append("\n"));

			controllerGenerateService.generateControllersByCategory(projectId, basePackage)
				.forEach((fileName, content) -> codeResult.append(content).append("\n"));

			dockerComposeService.generateDockerComposeByDependenciesAndSave(projectId, dependencies)
				.forEach((fileName, content) -> codeResult.append(content).append("\n"));

			return ResponseEntity.ok(codeResult.toString());

		} catch (IOException e) {
			throw new CommonException(ErrorCode.ERD_PARSING_FAILED);
		}
	}

}
