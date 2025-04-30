package com.checkmate.checkit.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.checkmate.checkit.project.entity.ProjectMemberEntity;
import com.checkmate.checkit.project.entity.ProjectMemberId;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMemberEntity, ProjectMemberId> {

	// 회원이 참여한 프로젝트 중 승인된 것만 조회 (삭제되지 않은 것만)
	List<ProjectMemberEntity> findById_UserIdAndIsApprovedTrueAndIsDeletedFalse(Integer userId);
}
