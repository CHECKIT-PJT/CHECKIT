package com.checkmate.checkit.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.checkmate.checkit.project.entity.SequenceDiagramEntity;

@Repository
public interface SequenceDiagramRepository extends JpaRepository<SequenceDiagramEntity, Integer> {
	Optional<SequenceDiagramEntity> findByProjectIdAndPlantUmlCodeIsNotNull(Integer projectId);
}
