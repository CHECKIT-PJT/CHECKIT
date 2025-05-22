package com.checkmate.checkit.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class JiraProjectListResponse {
	private String id;
	private String key;
	private String name;
	private String projectTypeKey;
}
