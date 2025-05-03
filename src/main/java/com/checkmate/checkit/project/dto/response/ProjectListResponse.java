package com.checkmate.checkit.project.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProjectListResponse {
	private Integer projectId;
	private String projectName;
}
