package com.checkmate.checkit.sequencediagram;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SequenceDiagramRepository extends JpaRepository<SequenceDiagramEntity, Integer> {
	Optional<SequenceDiagramEntity> findByProjectIdAndPlantUmlCodeIsNotNullAndCategory(Integer projectId,
		String category);

	boolean existsByProjectIdAndPlantUmlCodeIsNotNull(Integer projectId);
}
