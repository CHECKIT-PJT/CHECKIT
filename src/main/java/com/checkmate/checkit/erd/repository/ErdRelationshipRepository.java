package com.checkmate.checkit.erd.repository;

import com.checkmate.checkit.erd.entity.ErdRelationshipEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ErdRelationshipRepository extends JpaRepository<ErdRelationshipEntity, UUID> {

    @Query("SELECT r FROM ErdRelationshipEntity r WHERE r.project.id = :projectId")
    List<ErdRelationshipEntity> findAllByProjectId(@Param("projectId") int projectId);
}
