package com.checkmate.checkit.springsettings.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.checkmate.checkit.springsettings.entity.SpringSettingsEntity;

public interface SpringSettingsRepository extends JpaRepository<SpringSettingsEntity, Integer> {

	Optional<SpringSettingsEntity> findByProjectEntityId(Integer projectId);

	void deleteByProjectEntityId(Integer projectId);
}
