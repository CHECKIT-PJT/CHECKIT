package com.checkmate.checkit.global.common.infra.ai;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.checkmate.checkit.chatbot.dto.ChatRequest;
import com.checkmate.checkit.chatbot.dto.ChatResponse;
import com.checkmate.checkit.readme.dto.GenerateReadmeRequest;
import com.checkmate.checkit.sequencediagram.dto.GenerateSequenceDiagramRequest;
import com.checkmate.checkit.readme.dto.ReadmeResponse;
import com.checkmate.checkit.sequencediagram.dto.SequenceDiagramResponse;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class AiClientService {

	@Qualifier("aiWebClient")
	private final WebClient aiWebClient;

	public Mono<ReadmeResponse> requestReadme(GenerateReadmeRequest request) {
		return aiWebClient.post()
			.uri("/api/readme")
			.bodyValue(request)
			.retrieve()
			.bodyToMono(ReadmeResponse.class);
	}

	public Mono<SequenceDiagramResponse> requestSequenceDiagram(GenerateSequenceDiagramRequest request) {
		return aiWebClient.post()
			.uri("/api/sequence")
			.bodyValue(request)
			.retrieve()
			.bodyToMono(SequenceDiagramResponse.class);
	}

	public Flux<String> streamChatResponseWithFallback(ChatRequest request) {
		return aiWebClient.post()
			.uri("/api/chat/stream")
			.bodyValue(request)
			.accept(MediaType.TEXT_PLAIN)
			.retrieve()
			.bodyToFlux(String.class)
			.onErrorResume(error -> {
				// fallback: 동기식 요청으로 대체
				return aiWebClient.post()
					.uri("/api/chat")
					.bodyValue(request)
					.retrieve()
					.bodyToMono(ChatResponse.class)
					.flatMapMany(resp -> {
						if (resp.response() == null) {
							return Flux.empty();
						}
						// 응답 텍스트를 Flux로 분리해서 전달
						return Flux.just(resp.response());
					});
			});
	}

}

