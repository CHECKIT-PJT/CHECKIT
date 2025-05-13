package com.checkmate.checkit.springsettings.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.exception.CommonException;
import com.checkmate.checkit.project.entity.ProjectEntity;
import com.checkmate.checkit.project.repository.ProjectRepository;
import com.checkmate.checkit.springsettings.dto.DependenciesDtoRequest;
import com.checkmate.checkit.springsettings.dto.DependencyDtoResponse;
import com.checkmate.checkit.springsettings.dto.SpringSettingsDtoRequest;
import com.checkmate.checkit.springsettings.dto.SpringSettingsDtoResponse;
import com.checkmate.checkit.springsettings.entity.DependencyEntity;
import com.checkmate.checkit.springsettings.entity.SpringSettingsEntity;
import com.checkmate.checkit.springsettings.repository.DependencyRepository;
import com.checkmate.checkit.springsettings.repository.SpringSettingsRepository;
import com.checkmate.checkit.springsettings.util.DependencyProvider;
import jakarta.transaction.Transactional;

@Service
public class SpringSettingsService {

	@Autowired
	private SpringSettingsRepository springSettingsRepository;

	@Autowired
	private ProjectRepository projectRepository;
	@Autowired
	private DependencyRepository dependencyRepository;

	public SpringSettingsDtoResponse createSpringSettings(Integer projectId, DependenciesDtoRequest request) {
		// 프로젝트 정보 조회 후 엔티티 생성
		SpringSettingsDtoRequest settingsRequest = request.getSpringSettings();
		SpringSettingsEntity settingsEntity = projectRepository.findById(projectId)
			.map(settingsRequest::toEntity)
			.orElseThrow(() -> new CommonException(ErrorCode.SPRING_SETTINGS_NOT_FOUND));

		// 스프링 세팅 저장
		SpringSettingsEntity savedSettings = springSettingsRepository.save(settingsEntity);

		// 선택된 의존성들 저장
		List<DependencyEntity> dependencyEntities = request.getSelectedDependencies().stream()
			.map(depName -> DependencyEntity.builder()
				.projectEntity(savedSettings.getProjectEntity())
				.dependencyName(depName)
				.build())
			.collect(Collectors.toList());

		dependencyRepository.saveAll(dependencyEntities);

		// 문자열 리스트로 변환
		List<String> dependencyNames = dependencyEntities.stream()
			.map(DependencyEntity::getDependencyName)
			.collect(Collectors.toList());

		return SpringSettingsDtoResponse.fromEntity(savedSettings, dependencyNames);
	}

	public SpringSettingsDtoResponse getSpringSettings(Integer projectId) {
		SpringSettingsEntity entity = springSettingsRepository.findByProjectEntityId(projectId)
			.orElseThrow(() -> new CommonException(ErrorCode.SPRING_SETTINGS_NOT_FOUND));

		List<String> deps = dependencyRepository.findByProjectEntity_Id(projectId)
			.stream()
			.map(DependencyEntity::getDependencyName)
			.collect(Collectors.toList());

		return SpringSettingsDtoResponse.fromEntity(entity, deps); // 의존성 포함해서 응답
	}

	@Transactional
	public SpringSettingsDtoResponse updateSpringSettings(Integer projectId, DependenciesDtoRequest request) {
		ProjectEntity projectEntity = projectRepository.findById(projectId)
			.orElseThrow(() -> new CommonException(ErrorCode.PROJECT_NOT_FOUND));

		SpringSettingsEntity entity = springSettingsRepository.findByProjectEntityId(projectId)
			.orElseThrow(() -> new CommonException(ErrorCode.SPRING_SETTINGS_NOT_FOUND));

		// 값 갱신
		SpringSettingsDtoRequest settings = request.getSpringSettings();
		entity.update(
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

		springSettingsRepository.save(entity);

		// 정확한 메서드 이름 사용
		dependencyRepository.deleteByProjectEntity_Id(projectId);

		// 새 의존성 저장
		List<DependencyEntity> dependencies = request.getSelectedDependencies().stream()
			.map(depName -> DependencyEntity.builder()
				.projectEntity(projectEntity)
				.dependencyName(depName)
				.build())
			.collect(Collectors.toList());

		dependencyRepository.saveAll(dependencies);

		// 새 의존성 목록을 포함하여 반환
		List<String> selectedDeps = dependencies.stream()
			.map(DependencyEntity::getDependencyName)
			.collect(Collectors.toList());

		return SpringSettingsDtoResponse.fromEntity(entity, selectedDeps);
	}

	public void deleteSpringSettings(Integer projectId) {
		springSettingsRepository.deleteByProjectEntityId(projectId);
	}

	public DependencyDtoResponse getAllDependencies() {
		List<String> dependencyList = DependencyProvider.getAllDependencies();
		return new DependencyDtoResponse(dependencyList);
	}

}

