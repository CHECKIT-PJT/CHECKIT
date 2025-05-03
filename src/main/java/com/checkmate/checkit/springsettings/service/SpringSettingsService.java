package com.checkmate.checkit.springsettings.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.checkmate.checkit.project.repository.ProjectRepository;
import com.checkmate.checkit.springsettings.dto.SpringSettingsDtoRequest;
import com.checkmate.checkit.springsettings.dto.SpringSettingsDtoResponse;
import com.checkmate.checkit.springsettings.entity.SpringSettingsEntity;
import com.checkmate.checkit.springsettings.repository.SpringSettingsRepository;

@Service
public class SpringSettingsService {

	@Autowired
	private SpringSettingsRepository springSettingsRepository;

	@Autowired
	private ProjectRepository projectRepository;

	public SpringSettingsDtoResponse createSpringSettings(Integer projectId, SpringSettingsDtoRequest request) {
		SpringSettingsEntity entity = projectRepository.findById(projectId)
			.map(project -> request.toEntity(project))
			.orElseThrow(() -> new RuntimeException("Project not found"));

		SpringSettingsEntity saved = springSettingsRepository.save(entity);
		return SpringSettingsDtoResponse.fromEntity(saved);
	}

	public SpringSettingsDtoResponse getSpringSettings(Integer projectId) {
		SpringSettingsEntity entity = springSettingsRepository.findByProjectEntityId(projectId)
			.orElseThrow(() -> new RuntimeException("SpringSettings not found"));
		return SpringSettingsDtoResponse.fromEntity(entity);
	}

	public SpringSettingsDtoResponse updateSpringSettings(Integer projectId, SpringSettingsDtoRequest request) {
		SpringSettingsEntity entity = projectRepository.findById(projectId)
			.map(project -> request.toEntity(project))
			.orElseThrow(() -> new RuntimeException("Project not found"));

		SpringSettingsEntity saved = springSettingsRepository.save(entity);
		return SpringSettingsDtoResponse.fromEntity(saved);
	}

	public void deleteSpringSettings(Integer projectId) {
		springSettingsRepository.deleteByProjectEntityId(projectId);
	}
}
