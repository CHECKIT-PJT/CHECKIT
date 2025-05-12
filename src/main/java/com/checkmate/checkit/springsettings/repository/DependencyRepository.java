package com.checkmate.checkit.springsettings.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.checkmate.checkit.springsettings.entity.DependencyEntity;

public interface DependencyRepository extends JpaRepository<DependencyEntity, Long> {

	List<DependencyEntity> findByProjectEntity_Id(Integer projectId);

	void deleteByProjectEntity_Id(Integer projectId);
}

