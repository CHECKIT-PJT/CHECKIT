package com.checkmate.checkit.erd.repository;

import com.checkmate.checkit.erd.entity.ErdColumnEntity;
import com.checkmate.checkit.erd.entity.ErdTableEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ErdColumnRepository extends JpaRepository<ErdColumnEntity, UUID> {
    List<ErdColumnEntity> findAllByTableIn(List<ErdTableEntity> tables);
}
