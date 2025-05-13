package com.checkmate.checkit.functional.repository;

import com.checkmate.checkit.functional.entity.FunctionalSpec;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FunctionalSpecRepository extends JpaRepository<FunctionalSpec, Integer> {

    List<FunctionalSpec> findByProjectIdAndIsDeletedFalse(Integer projectId);
}
