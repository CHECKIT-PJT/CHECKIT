package com.checkmate.checkit.springsettings.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.checkmate.checkit.springsettings.entity.DependencyEntity;

public interface DependencyRepository extends JpaRepository<DependencyEntity, Long> {
	void deleteByProjectEntityId(Integer projectId);
}
