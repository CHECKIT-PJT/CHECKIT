package com.checkmate.checkit.project.dto.request;

import com.checkmate.checkit.project.entity.JiraProjectEntity;
import com.checkmate.checkit.project.entity.ProjectEntity;

public record JiraProjectUpdateRequest(
	String projectId,
	String projectKey,
	String projectName,
	String projectTypeKey
) {
	public JiraProjectEntity toEntity(ProjectEntity projectEntity) {
		return new JiraProjectEntity(
			projectEntity,
			this.projectId,
			this.projectKey,
			this.projectName,
			this.projectTypeKey
		);
	}
}
