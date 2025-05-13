package com.checkmate.checkit.git.dto.request;

public record GitPushRequest(
	String repoName,
	String visibility,
	String message
) {

}
