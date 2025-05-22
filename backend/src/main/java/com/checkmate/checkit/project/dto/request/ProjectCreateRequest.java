package com.checkmate.checkit.project.dto.request;

import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.exception.CommonException;
import com.checkmate.checkit.project.entity.ProjectEntity;

public record ProjectCreateRequest(
	String projectName
) {
	public ProjectCreateRequest {
		if (projectName == null || projectName.isBlank()) {
			throw new CommonException(ErrorCode.INVALID_PROJECT_NAME);
		}
		if (projectName.length() > 50) {
			throw new CommonException(ErrorCode.PROJECT_NAME_TOO_LONG);
		}
	}

	public ProjectEntity toEntity() {
		return new ProjectEntity(projectName);
	}
}
