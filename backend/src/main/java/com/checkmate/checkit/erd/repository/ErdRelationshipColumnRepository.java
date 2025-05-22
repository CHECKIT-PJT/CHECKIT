package com.checkmate.checkit.erd.repository;

import com.checkmate.checkit.erd.entity.ErdRelationshipColumnEntity;
import com.checkmate.checkit.erd.entity.ErdRelationshipEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ErdRelationshipColumnRepository extends JpaRepository<ErdRelationshipColumnEntity, UUID> {
    List<ErdRelationshipColumnEntity> findAllByRelationshipIn(List<ErdRelationshipEntity> relationships);
}