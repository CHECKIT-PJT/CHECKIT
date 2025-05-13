package com.checkmate.checkit.api.repository;

import com.checkmate.checkit.api.entity.DtoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DtoRepository extends JpaRepository<DtoEntity, Long> {
    List<DtoEntity> findByApiSpecId(Long apiSpecId);
}
