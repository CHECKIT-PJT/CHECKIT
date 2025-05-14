package com.checkmate.checkit.global.common.infra.ai;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.checkmate.checkit.readme.dto.GenerateReadmeRequest;
import com.checkmate.checkit.sequencediagram.dto.GenerateSequenceDiagramRequest;
import com.checkmate.checkit.readme.dto.ReadmeResponse;
import com.checkmate.checkit.sequencediagram.dto.SequenceDiagramResponse;
import lombok.RequiredArgsConstructor;
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
}

