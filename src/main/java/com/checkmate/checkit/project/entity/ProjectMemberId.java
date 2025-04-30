package com.checkmate.checkit.project.entity;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Embeddable
@NoArgsConstructor
@EqualsAndHashCode
@AllArgsConstructor
public class ProjectMemberId implements Serializable {

	@Column(name = "user_id", nullable = false)
	private Integer userId;

	@Column(name = "project_id", nullable = false)
	private Integer projectId;
}
