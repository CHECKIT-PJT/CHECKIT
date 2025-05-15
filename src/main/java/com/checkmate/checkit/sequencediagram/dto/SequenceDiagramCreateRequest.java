package com.checkmate.checkit.sequencediagram.dto;

import jakarta.validation.constraints.NotBlank;

public record SequenceDiagramCreateRequest(
	@NotBlank(message = "Sequence Diagram 내용은 비어 있을 수 없습니다.")
	String content,

	@NotBlank(message = "imgUrl 내용은 비어 있을 수 없습니다.")
	String diagramUrl
) {
}
