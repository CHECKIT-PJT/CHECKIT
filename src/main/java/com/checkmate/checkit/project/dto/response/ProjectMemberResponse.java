package com.checkmate.checkit.project.dto.response;

import com.checkmate.checkit.project.entity.ProjectMemberRole;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProjectMemberResponse {
	private Integer id;
	private String userName;
	private String nickname;
	private ProjectMemberRole role;
}
