package com.checkmate.checkit.project.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Project_members")
@Getter
@NoArgsConstructor
public class ProjectMemberEntity {

	@EmbeddedId
	private ProjectMemberId id;

	@Column(name = "is_approved", nullable = false)
	private boolean isApproved = false;

	@Column(name = "role", nullable = false)
	@Enumerated(EnumType.STRING)
	private ProjectMemberRole role;

	@Column(name = "deleted_at")
	private LocalDateTime deletedAt;

	@Column(name = "is_deleted", nullable = false)
	private boolean isDeleted = false;

	@Builder
	public ProjectMemberEntity(ProjectMemberId id, boolean isApproved, ProjectMemberRole role) {
		this.id = id;
		this.isApproved = isApproved;
		this.role = role;
	}

	// 소프트 삭제 메서드
	public void delete() {
		this.deletedAt = LocalDateTime.now();
		this.isDeleted = true;
	}
}
