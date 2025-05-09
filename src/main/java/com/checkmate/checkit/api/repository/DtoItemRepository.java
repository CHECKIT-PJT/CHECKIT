package com.checkmate.checkit.api.repository;

import com.checkmate.checkit.api.entity.DtoEntity;
import com.checkmate.checkit.api.entity.DtoItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DtoItemRepository extends JpaRepository<DtoItemEntity, Long> {
    List<DtoItemEntity> findByDto(DtoEntity dto);
    void deleteByDto(DtoEntity dto);
}
