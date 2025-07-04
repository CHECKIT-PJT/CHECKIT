package com.checkmate.checkit.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.checkmate.checkit.project.entity.ProjectEntity;

@Repository
public interface ProjectRepository extends JpaRepository<ProjectEntity, Integer> {
	// 삭제되지 않은 프로젝트 조회
	Optional<ProjectEntity> findByIdAndIsDeletedFalse(Integer projectId);
}

