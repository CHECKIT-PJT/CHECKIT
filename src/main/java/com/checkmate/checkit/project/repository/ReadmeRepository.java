package com.checkmate.checkit.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.checkmate.checkit.project.entity.ReadmeEntity;

@Repository
public interface ReadmeRepository extends JpaRepository<ReadmeEntity, Integer> {
	Optional<ReadmeEntity> findByProjectId(Integer projectId);
}
