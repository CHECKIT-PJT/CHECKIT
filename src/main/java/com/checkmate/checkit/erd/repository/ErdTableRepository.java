package com.checkmate.checkit.erd.repository;

import com.checkmate.checkit.erd.entity.ErdTableEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ErdTableRepository extends JpaRepository<ErdTableEntity, UUID> {
    @Query("SELECT DISTINCT t FROM ErdTableEntity t WHERE t.project.id = :projectId")
    List<ErdTableEntity> findAllWithColumns(@Param("projectId") int projectId);

    @Query("SELECT t FROM ErdTableEntity t WHERE t.project.id = :projectId")
    List<ErdTableEntity> findAllByProjectId(@Param("projectId") int projectId);
}
