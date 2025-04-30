package com.checkmate.checkit.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.checkmate.checkit.project.entity.ProjectEntity;

public interface ProjectRepository extends JpaRepository<ProjectEntity, Integer> {
	Optional<ProjectEntity> findById(Integer id);
}

