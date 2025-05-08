package com.checkmate.checkit.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.checkmate.checkit.api.entity.ApiSpecEntity;

public interface ApiSpecRepository extends JpaRepository<ApiSpecEntity, Long> {

	List<ApiSpecEntity> findAllByProjectId_Id(Integer projectId);

	List<ApiSpecEntity> findByProjectId(Long projectId);
}
