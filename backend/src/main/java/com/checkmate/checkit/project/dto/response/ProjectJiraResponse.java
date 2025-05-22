package com.checkmate.checkit.project.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProjectJiraResponse {
	private Integer jiraProjectId;
	private String jiraProjectKey;
	private String jiraProjectName;
	private String projectTypeKey;
	private Long jiraBoardId;
}
