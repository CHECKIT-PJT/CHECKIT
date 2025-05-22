package com.checkmate.checkit.chatbot.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

// ChatResponse.java
public record ChatResponse(
	@JsonProperty("is_success") boolean isSuccess,
	String message,
	String response
) {}
