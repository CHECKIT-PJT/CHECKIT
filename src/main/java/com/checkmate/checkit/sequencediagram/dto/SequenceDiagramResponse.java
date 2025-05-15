package com.checkmate.checkit.sequencediagram.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SequenceDiagramResponse {
	@JsonProperty("plantuml_code")
	private String content;

	@JsonProperty("diagram_url")
	private String diagramUrl;
}
