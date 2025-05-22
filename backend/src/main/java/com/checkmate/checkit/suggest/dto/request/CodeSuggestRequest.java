package com.checkmate.checkit.suggest.dto.request;

public record CodeSuggestRequest(
	String code,
	int cursorLine,
	int cursorColumn
) {
}
