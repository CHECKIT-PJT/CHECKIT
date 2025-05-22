package com.checkmate.checkit.project.dto.request;

import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.exception.CommonException;

public record ProjectUpdateRequest(
	String projectName
) {
	public ProjectUpdateRequest {
		if (projectName == null || projectName.isBlank()) {
			throw new CommonException(ErrorCode.INVALID_PROJECT_NAME);
		}
		if (projectName.length() > 50) {
			throw new CommonException(ErrorCode.PROJECT_NAME_TOO_LONG);
		}
	}
}
