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
				이 위치에 들어갈 가장 적절한 Java 코드를 완성해주세요.
				
				[지시사항]
				1. 제공된 코드와 커서 위치를 정확히 분석하세요.
				2. 현재 코드 블록(if문, for문, 메서드 등)의 문맥을 파악하세요.
				3. 변수명, 메서드명, 클래스명의 명명 규칙을 유지하세요.
				4. 코드 스타일과 들여쓰기 패턴을 일관되게 유지하세요.
				5. 오직 다음에 작성되어야 할 코드 조각만 제안하세요(마크다운 없이).
				6. 사용자가 작성하려는 의도를 파악하여 10-50자 내외의 간결한 코드를 제안하세요.
				7. 반환값은 소스 코드만 포함해야 합니다 - 설명, 마크다운, 주석은 포함하지 마세요.
				8. 여러 가능성이 있는 경우, 가장 확률이 높은 한 가지만 제안하세요.
				
				[코드]
				%s
				""",
			codeSuggestRequest.cursorLine(),
			codeSuggestRequest.cursorColumn(),
			codeSuggestRequest.code());

		WebClient client = WebClient.builder()
			.baseUrl("https://api.openai.com/v1")
			.defaultHeader("Authorization", "Bearer " + apiKey)
			.defaultHeader("Content-Type", "application/json")
			.build();

		Map<String, Object> request = Map.of(
			"model", "gpt-4",
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
				String cleaned = result.replaceAll("(?s)^```[a-zA-Z]*\\n?", "")
					.replaceAll("```$", ""); // 뒷부분만 잘라냄

				return new CodeSuggestResponse(cleaned);
			}
			return new CodeSuggestResponse("제안된 코드가 없습니다.");
		} catch (Exception e) {
			throw new RuntimeException("OpenAI API 요청 실패", e);
		}
	}

}

