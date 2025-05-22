package com.checkmate.checkit.erd.repository;

import com.checkmate.checkit.erd.entity.ErdSnapshot;
import com.checkmate.checkit.project.entity.ProjectEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ErdSnapshotRepository extends JpaRepository<ErdSnapshot, Long> {

    // 프로젝트 기준으로 ERD 스냅샷 조회
    Optional<ErdSnapshot> findByProject(ProjectEntity project);
}
