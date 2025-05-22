package com.checkmate.checkit.git.dto.request;

import java.util.List;

import com.checkmate.checkit.git.dto.response.GitFileNode;

public record CommitAndPushRequest(
	String message,
	List<GitFileNode> changedFiles
) {
}
