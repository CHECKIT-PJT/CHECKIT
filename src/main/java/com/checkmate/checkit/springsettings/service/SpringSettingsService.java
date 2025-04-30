package com.checkmate.checkit.springsettings.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.checkmate.checkit.project.repository.ProjectRepository;
import com.checkmate.checkit.springsettings.entity.SpringSettingsEntity;
import com.checkmate.checkit.springsettings.repository.SpringSettingsRepository;

@Service
public class SpringSettingsService {
	@Autowired
	private SpringSettingsRepository springSettingsRepository;

	@Autowired
	private ProjectRepository projectRepository;

	// SpringSettings 생성
	public SpringSettingsEntity createSpringSettings(Integer projectId, SpringSettingsEntity springSettings) {
		return projectRepository.findById(projectId)
			.map(project -> {
				springSettings.setProjectEntity(project);
				return springSettingsRepository.save(springSettings);
			})
			.orElseThrow(() -> new RuntimeException("Project not found"));
	}

	// SpringSettings 조회
	public SpringSettingsEntity getSpringSettings(Integer projectId) {
		return springSettingsRepository.findByProjectEntityId(projectId)
			.orElseThrow(() -> new RuntimeException("SpringSettings not found"));
	}

	// SpringSettings 수정
	public SpringSettingsEntity updateSpringSettings(Integer projectId, SpringSettingsEntity springSettings) {
		return projectRepository.findById(projectId)
			.map(project -> {
				springSettings.setProjectEntity(project);
				return springSettingsRepository.save(springSettings);
			})
			.orElseThrow(() -> new RuntimeException("Project not found"));
	}

	// SpringSettings 삭제
	public void deleteSpringSettings(Integer projectId) {
		springSettingsRepository.deleteByProjectEntityId(projectId);
	}

	// 사용 가능한 의존성 목록 조회
	public List<String> getAvailableDependencies() {
		return List.of(
			"web", "jpa", "lombok", "security", "actuator", "devtools",
			"mysql", "postgresql", "redis", "mongodb", "graphql",
			"hibernate", "swagger", "thymeleaf", "docker"
		);
	}
}
