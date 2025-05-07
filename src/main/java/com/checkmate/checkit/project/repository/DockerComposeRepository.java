package com.checkmate.checkit.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.checkmate.checkit.project.entity.DockerComposeEntity;

@Repository
public interface DockerComposeRepository extends JpaRepository<DockerComposeEntity, Integer> {
	Optional<DockerComposeEntity> findByProjectId(Integer projectId);
}
