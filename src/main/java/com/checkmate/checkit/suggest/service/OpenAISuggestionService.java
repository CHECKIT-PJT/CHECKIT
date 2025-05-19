package com.checkmate.checkit.suggest.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.checkmate.checkit.global.config.JwtTokenProvider;
import com.checkmate.checkit.project.service.ProjectService;
import com.checkmate.checkit.suggest.dto.request.CodeSuggestRequest;
import com.checkmate.checkit.suggest.dto.response.CodeSuggestResponse;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OpenAISuggestionService {

	@Value("${ai.api.key}")
	private String apiKey;

	private final JwtTokenProvider jwtTokenProvider;
	private final ProjectService projectService;

	public CodeSuggestResponse getSuggestion(String accessToken, int projectId, CodeSuggestRequest codeSuggestRequest) {
		projectService.validateUserAndProject(jwtTokenProvider.getUserIdFromToken(accessToken), projectId);

		// 프롬프트 생성
		String prompt = String.format("""
			다음은 사용자가 작성 중인 Java 코드입니다.
			사용자는 %d번째 줄, %d번째 칸에 커서를 두고 있습니다.
			이 위치에 들어갈 자연스러운 Java 코드를 완성해주세요.
			추측이 아닌, 주어진 문맥을 기반으로 함수 내부/외부 여부와 문법을 고려해 정확하고 간결한 코드를 제안해주세요.
			
			코드:
			%s
			""", codeSuggestRequest.cursorLine(), codeSuggestRequest.cursorColumn(), codeSuggestRequest.code());

		WebClient client = WebClient.builder()
			.baseUrl("https://api.openai.com/v1")
			.defaultHeader("Authorization", "Bearer " + apiKey)
			.defaultHeader("Content-Type", "application/json")
			.build();

		Map<String, Object> request = Map.of(
			"model", "gpt-3.5-turbo",
			"messages", List.of(
				Map.of("role", "system", "content", "당신은 유능한 Java 백엔드 개발자입니다."),
				Map.of("role", "user", "content", prompt)
			),
			"temperature", 0.2
		);

		try {
			String result = client.post()
				.uri("/chat/completions")
				.bodyValue(request)
				.retrieve()
				.bodyToMono(JsonNode.class)
				.map(json -> json.get("choices").get(0).get("message").get("content").asText())
				.block();

			// 마크다운 ``` 제거
			if (result != null) {
				return new CodeSuggestResponse(result.replaceAll("(?s)^```[a-zA-Z]*\\n?|```$", "").trim());
			}
			return new CodeSuggestResponse("제안된 코드가 없습니다.");
		} catch (Exception e) {
			throw new RuntimeException("OpenAI API 요청 실패", e);
		}
	}

}

