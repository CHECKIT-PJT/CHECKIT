package com.checkmate.checkit.project.dto.response;

import com.checkmate.checkit.project.entity.ProjectMemberRole;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProjectMemberListResponse {
	private Integer id;
	private String userName;
	private ProjectMemberRole role;
	private Boolean approved;
}
