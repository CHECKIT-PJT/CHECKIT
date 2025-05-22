package com.checkmate.checkit.readme.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ReadmeResponse {
	@JsonProperty("is_success")
	private boolean isSuccess;
	private String readme;
	private String reason;
}
