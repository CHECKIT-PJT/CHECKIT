package com.checkmate.checkit.sequencediagram.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

public record GenerateSequenceDiagramRequest(
	@NotNull(message = "project_id는 필수입니다.")
	@JsonProperty("project_id")Integer projectId,

	@NotNull(message = "llm_type은 필수입니다.")
	@JsonProperty("llm_type") String llmType,

	@NotNull(message = "category는 필수입니다.")
	@JsonProperty("category") String category
) {
}
