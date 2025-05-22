package com.checkmate.checkit.git.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GitFileNode {
	private String path;
	private String type;
	private String content;
}
