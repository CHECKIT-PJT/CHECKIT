package com.checkmate.checkit.project.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProjectDetailResponse {
	private Integer projectId;
	private String projectName;
	private List<ProjectMemberResponse> projectMembers;
	private String repositoryUrl;
	private String createdAt;
	private String updatedAt;
}
