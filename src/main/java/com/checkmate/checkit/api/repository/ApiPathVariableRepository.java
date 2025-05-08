package com.checkmate.checkit.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.checkmate.checkit.api.entity.ApiPathVariableEntity;
import com.checkmate.checkit.api.entity.ApiSpecEntity;

public interface ApiPathVariableRepository extends JpaRepository<ApiPathVariableEntity, Long> {

	List<ApiPathVariableEntity> findAllByApiSpec(ApiSpecEntity apiSpec);

	List<ApiPathVariableEntity> findByApiSpec(ApiSpecEntity apiSpec);
	void deleteByApiSpec(ApiSpecEntity apiSpec);
}
