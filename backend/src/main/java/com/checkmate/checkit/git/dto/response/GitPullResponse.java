package com.checkmate.checkit.git.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GitPullResponse {
	private String root;
	private String branch;
	private List<GitFileNode> files;
}
