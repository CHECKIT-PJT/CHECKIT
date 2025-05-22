package com.checkmate.checkit.git.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class GitRepositoryInfo {
	private String url;
	private Integer gitlabProjectId;
}
