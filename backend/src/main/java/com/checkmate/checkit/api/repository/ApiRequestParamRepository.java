package com.checkmate.checkit.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.checkmate.checkit.api.entity.ApiRequestParamEntity;
import com.checkmate.checkit.api.entity.ApiSpecEntity;

public interface ApiRequestParamRepository extends JpaRepository<ApiRequestParamEntity, Long> {

	List<ApiRequestParamEntity> findAllByApiSpec(ApiSpecEntity apiSpec);
}
