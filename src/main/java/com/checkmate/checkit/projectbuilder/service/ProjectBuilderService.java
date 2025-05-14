package com.checkmate.checkit.projectbuilder.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.checkmate.checkit.api.entity.ApiSpecEntity;
import com.checkmate.checkit.api.repository.ApiSpecRepository;
import com.checkmate.checkit.codegenerator.service.ControllerGenerateService;
import com.checkmate.checkit.codegenerator.service.DtoGenerateService;
import com.checkmate.checkit.codegenerator.service.EntityGenerateService;
import com.checkmate.checkit.codegenerator.service.RepositoryGenerateService;
import com.checkmate.checkit.codegenerator.service.ServiceGenerateService;
import com.checkmate.checkit.erd.dto.response.ErdSnapshotResponse;
import com.checkmate.checkit.erd.service.ErdService;
import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.exception.CommonException;
import com.checkmate.checkit.projectbuilder.dto.InitializerRequest;
import com.checkmate.checkit.projectbuilder.mapper.InitializerRequestMapper;
import com.checkmate.checkit.springsettings.dto.SpringSettingsDtoResponse;
import com.checkmate.checkit.springsettings.service.SpringSettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectBuilderService {

	private final SpringSettingsService springSettingsService;
	private final ErdService erdService;
	private final ApiSpecRepository apiSpecRepository;
	private final ProjectDownloadService projectDownloadService;
	private final EntityGenerateService entityGenerateService;
	private final DtoGenerateService dtoGenerateService;
	private final RepositoryGenerateService repositoryGenerateService;
	private final ServiceGenerateService serviceGenerateService;
	private final ControllerGenerateService controllerGenerateService;
	private final CodeSaveService codeSaveService;

	/**
	 * 전체 프로젝트 빌드 오케스트레이션: 다운로드 + 코드 생성 + 저장
	 */
	public void buildProject(int projectId) throws IOException {
		// 1. 스프링 설정 확인
		SpringSettingsDtoResponse springSettings = springSettingsService.getSpringSettings(projectId);
		String basePackage = springSettings.getSpringPackageName();
		String springName = springSettings.getSpringName();

		// 2. ERD 확인
		ErdSnapshotResponse erdData = erdService.getErdByProjectId(projectId);
		if (erdData == null || erdData.getErdJson() == null || erdData.getErdJson().isBlank()) {
			throw new CommonException(ErrorCode.ERD_NOT_FOUND);
		}
		String erdJson = erdData.getErdJson();

		// 3. API 명세 확인
		List<ApiSpecEntity> apiSpecs = apiSpecRepository.findAllByProjectId_Id(projectId);
		if (apiSpecs.isEmpty()) {
			throw new CommonException(ErrorCode.API_SPEC_NOT_FOUND);
		}

		// 4. Spring Initializr로 프로젝트 다운로드 및 압축 해제
		InitializerRequest initializerRequest = InitializerRequestMapper.from(springSettings);
		projectDownloadService.downloadAndExtract(initializerRequest);

		// 5. 코드 자동 생성
		Map<String, String> entityFiles = entityGenerateService.generateEntitiesFromErdJson(erdJson, basePackage);
		Map<String, String> dtoFiles = dtoGenerateService.generateDtos(projectId, basePackage);
		Map<String, String> queryDtoFiles = dtoGenerateService.generateQueryDtos(projectId, basePackage);
		Map<String, String> repositoryFiles = repositoryGenerateService.generateRepositoriesFromErdJson(erdJson,
			basePackage);
		Map<String, String> serviceFiles = serviceGenerateService.generateServiceCodeByCategory(projectId, basePackage);
		Map<String, String> controllerFiles = controllerGenerateService.generateControllersByCategory(projectId,
			basePackage);

		// 6. 파일 저장
		codeSaveService.save(springName, basePackage, entityFiles);
		codeSaveService.save(springName, basePackage, dtoFiles);
		codeSaveService.save(springName, basePackage, queryDtoFiles);
		codeSaveService.save(springName, basePackage, repositoryFiles);
		codeSaveService.save(springName, basePackage, serviceFiles);
		codeSaveService.save(springName, basePackage, controllerFiles);
	}
}
