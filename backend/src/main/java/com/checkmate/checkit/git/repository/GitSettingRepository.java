package com.checkmate.checkit.git.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.checkmate.checkit.git.entity.GitSettingsEntity;

@Repository
public interface GitSettingRepository extends JpaRepository<GitSettingsEntity, Integer> {

	// 프로젝트 Id를 통해 Git 설정 조회
	Optional<GitSettingsEntity> findByProjectId(Integer projectId);
}
