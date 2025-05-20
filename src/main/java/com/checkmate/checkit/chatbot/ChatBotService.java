package com.checkmate.checkit.chatbot;

import com.checkmate.checkit.chatbot.dto.ChatRequest;
import com.checkmate.checkit.global.common.infra.ai.AiClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
public class ChatBotService {

	private final AiClientService aiClientService;

	public Flux<String> processChatStream(ChatRequest request) {
		return aiClientService.streamChatResponseWithFallback(request);
	}
}

