package com.checkmate.checkit.suggest.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.checkmate.checkit.global.code.SuccessCode;
import com.checkmate.checkit.global.response.JSONResponse;
import com.checkmate.checkit.suggest.dto.request.CodeSuggestRequest;
import com.checkmate.checkit.suggest.dto.response.CodeSuggestResponse;
import com.checkmate.checkit.suggest.service.OpenAISuggestionService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/suggest")
@RequiredArgsConstructor
public class CodeSuggestController {

	private final OpenAISuggestionService openAISuggestionService;

	@PostMapping("/{projectId}/code")
	public ResponseEntity<JSONResponse<CodeSuggestResponse>> suggestCode(
		@RequestHeader("Authorization") String authorization,
		@RequestBody CodeSuggestRequest request,
		@PathVariable Integer projectId) {

		String accessToken = authorization.replace("Bearer ", "");

		CodeSuggestResponse suggestion = openAISuggestionService.getSuggestion(accessToken, projectId, request);
		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, suggestion));
	}
}
