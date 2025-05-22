package com.checkmate.checkit.chatbot.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

// ChatRequest.java
public record ChatRequest(
	String message,
	String category,
	@JsonProperty("llm_type") String llmType
) { }

