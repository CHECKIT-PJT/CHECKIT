package com.checkmate.checkit.chatbot;

import com.checkmate.checkit.chatbot.dto.ChatRequest;
import com.checkmate.checkit.global.common.infra.ai.AiClientService;
import com.checkmate.checkit.global.config.properties.AiProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
public class ChatBotService {

	private final AiClientService aiClientService;
	private final AiProperties aiProperties;

	public Flux<String> processChatStream(ChatRequest request) {
		// 무조건 .yml에서 가져온 값으로 덮어씀
		String llmType = aiProperties.getLlm().getType();

		ChatRequest finalRequest = new ChatRequest(
				request.message(),
				request.category(),
				llmType
		);

		return aiClientService.streamChatResponseWithFallback(finalRequest);
	}
}

