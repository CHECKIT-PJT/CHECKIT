package com.checkmate.checkit.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.checkmate.checkit.api.entity.ApiSpecEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ApiSpecRepository extends JpaRepository<ApiSpecEntity, Long> {

	List<ApiSpecEntity> findAllByProjectId_Id(Integer projectId);

	List<ApiSpecEntity> findByProjectId(int projectId);

	Optional<ApiSpecEntity> findByIdAndProjectId(Long id, int projectId);

	@Query("SELECT DISTINCT a.category FROM ApiSpecEntity a WHERE a.project.id = :projectId AND a.isDeleted = false")
	List<String> findDistinctCategoriesByProjectId(@Param("projectId") int projectId);
}
