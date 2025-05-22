package com.checkmate.checkit.api.repository;

import com.checkmate.checkit.api.entity.ApiQueryStringEntity;
import com.checkmate.checkit.api.entity.ApiSpecEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApiQueryStringRepository extends JpaRepository<ApiQueryStringEntity, Long> {
    List<ApiQueryStringEntity> findByApiSpec(ApiSpecEntity apiSpec);
    void deleteByApiSpec(ApiSpecEntity apiSpec);
}
