package com.checkmate.checkit.project.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProjectMemberWithEmailResponse {
	private Integer userId;
	private String email;
}
