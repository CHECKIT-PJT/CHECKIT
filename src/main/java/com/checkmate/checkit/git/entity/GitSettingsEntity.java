package com.checkmate.checkit.git.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Table(name = "git_settings")
@Entity
@Getter
@NoArgsConstructor
public class GitSettingsEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	// Project의 세부 정보는 GitSettings에 필요하지 않으므로, ProjectEntity를 직접 참조하지 않고 projectId를 사용.
	@Column(name = "project_id", nullable = false)
	private Integer projectId;

	@Column(columnDefinition = "TEXT")
	private String commitConventionReg;

	@Column(columnDefinition = "TEXT")
	private String branchConventionReg;

	@Column(columnDefinition = "TEXT")
	private String gitIgnore;

	@Builder
	public GitSettingsEntity(Integer projectId, String commitConventionReg, String branchConventionReg,
		String gitIgnore) {
		this.projectId = projectId;
		this.commitConventionReg = commitConventionReg;
		this.branchConventionReg = branchConventionReg;
		this.gitIgnore = gitIgnore;
	}

	public void createGitIgnore(String content) {
		this.gitIgnore = content;
	}

	public void updateGitIgnore(String content) {
		this.gitIgnore = content;
	}
}
