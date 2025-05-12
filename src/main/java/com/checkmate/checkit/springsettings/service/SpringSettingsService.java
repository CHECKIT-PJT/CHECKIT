package com.checkmate.checkit.springsettings.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

@Service
public class SpringSettingsService {

	@Autowired
	private SpringSettingsRepository springSettingsRepository;

	@Autowired
	private ProjectRepository projectRepository;
	@Autowired
	private DependencyRepository dependencyRepository;

	public SpringSettingsDtoResponse createSpringSettings(Integer projectId, DependenciesDtoRequest request) {
		//프로젝트 정보조회 후 엔티티 생성
		SpringSettingsDtoRequest settingsRequest = request.getSpringSettings();
		SpringSettingsEntity settingsEntity = projectRepository.findById(projectId)
			.map(settingsRequest::toEntity)
			.orElseThrow(() -> new RuntimeException("Project not found"));

		// 스프링 세팅 저장
		SpringSettingsEntity savedSettings = springSettingsRepository.save(settingsEntity);

		// 선택된 의존성들 저장
		List<DependencyEntity> dependencies = request.getSelectedDependencies().stream()
			.map(depName -> DependencyEntity.builder()
				.projectEntity(savedSettings.getProjectEntity())
				.dependencyName(depName)
				.build())
			.collect(Collectors.toList());

		dependencyRepository.saveAll(dependencies);

		// 응답 객체로 변환 후 반환
		return SpringSettingsDtoResponse.fromEntity(savedSettings);
	}

	public SpringSettingsDtoResponse getSpringSettings(Integer projectId) {
		SpringSettingsEntity entity = springSettingsRepository.findByProjectEntityId(projectId)
			.orElseThrow(() -> new RuntimeException("SpringSettings not found"));
		return SpringSettingsDtoResponse.fromEntity(entity);
	}

	public SpringSettingsDtoResponse updateSpringSettings(Integer projectId, DependenciesDtoRequest request) {
		ProjectEntity projectEntity = projectRepository.findById(projectId)
			.orElseThrow(() -> new RuntimeException("Project not found"));

		SpringSettingsEntity entity = springSettingsRepository.findByProjectEntityId(projectId)
			.orElseThrow(() -> new RuntimeException("Spring settings not found"));

		// 값 갱싱
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

		//기존 의존성 삭제
		dependencyRepository.deleteByProjectEntityId(projectId);

		//새 의존성으로 교체
		List<DependencyEntity> dependencies = request.getSelectedDependencies().stream()
			.map(depName -> DependencyEntity.builder()
				.projectEntity(projectEntity)
				.dependencyName(depName)
				.build())
			.collect(Collectors.toList());

		dependencyRepository.saveAll(dependencies);
		return SpringSettingsDtoResponse.fromEntity(entity);
	}

	public void deleteSpringSettings(Integer projectId) {
		springSettingsRepository.deleteByProjectEntityId(projectId);
	}

	public DependencyDtoResponse getAllDependencies() {
		List<String> dependencyList = DependencyProvider.getAllDependencies();
		return new DependencyDtoResponse(dependencyList);
	}

}

