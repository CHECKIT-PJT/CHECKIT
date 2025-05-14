package com.checkmate.checkit.readme;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReadmeRepository extends JpaRepository<ReadmeEntity, Integer> {
	Optional<ReadmeEntity> findByProjectIdAndIsDeletedFalse(Integer projectId);
	boolean existsByProjectIdAndIsDeletedFalse(Integer projectId); //
}
