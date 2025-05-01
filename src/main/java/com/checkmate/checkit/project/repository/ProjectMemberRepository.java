package com.checkmate.checkit.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.checkmate.checkit.project.entity.ProjectMemberEntity;
import com.checkmate.checkit.project.entity.ProjectMemberId;
import com.checkmate.checkit.project.entity.ProjectMemberRole;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMemberEntity, ProjectMemberId> {

	// 회원이 참여한 프로젝트 중 승인된 것만 조회 (삭제되지 않은 것만)
	List<ProjectMemberEntity> findById_UserIdAndIsApprovedTrueAndIsDeletedFalse(Integer userId);

	// 프로젝트 소속 회원 조회 (삭제되지 않고 승인된 것만)
	List<ProjectMemberEntity> findById_ProjectIdAndIsApprovedTrueAndIsDeletedFalse(Integer projectId);

	// 로그인한 회원이 해당 프로젝트에 멤버인지 검증 (삭제되지 않고 승인된 것만)
	Boolean existsById_UserIdAndId_ProjectIdAndIsApprovedTrueAndIsDeletedFalse(Integer userId, Integer projectId);

	// 로그인한 회원과 프로젝트 Id를 통해 프로젝트 멤버 조회 (삭제되지 않고 승인된 것만)
	Optional<ProjectMemberEntity> findById_UserIdAndId_ProjectIdAndIsApprovedTrueAndIsDeletedFalse(Integer userId,
		Integer projectId);

	// 프로젝트 Id를 통해 프로젝트 멤버가 존재하는지 검증 (삭제되지 않고 승인된 것만)
	Boolean existsById_ProjectIdAndRoleAndIsApprovedTrueAndIsDeletedFalse(Integer projectId, ProjectMemberRole role);
}
