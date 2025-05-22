package com.checkmate.checkit.project.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProjectMemberWithExternalIdResponse {
	private Integer userId;
	private String externalId;
}
