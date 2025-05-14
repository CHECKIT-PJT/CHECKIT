package com.checkmate.checkit.readme.dto;

import jakarta.validation.constraints.NotBlank;

public record ReadmeUpdateRequest(
	@NotBlank(message = "README 내용은 비어 있을 수 없습니다.")
	String content
) {
}
