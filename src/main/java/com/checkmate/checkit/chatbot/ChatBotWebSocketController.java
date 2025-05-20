package com.checkmate.checkit.chatbot;

import java.security.Principal;

import com.checkmate.checkit.chatbot.dto.ChatRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Flux;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatBotWebSocketController {

	private final ChatBotService chatBotService;
	private final SimpMessagingTemplate messagingTemplate;

	@MessageMapping("/chat/stream")
	public void handleChat(ChatRequest request, Principal principal) {
		if (principal == null) {
			log.error("❌ WebSocket principal is null - 인증 실패");
			return;
		}

		String username = principal.getName();
		log.info("📩 채팅 요청 수신 - 사용자: {}", username);
		log.info("📩 요청 내용: {}", request);

		try {
			Flux<String> responseFlux = chatBotService.processChatStream(request);

			responseFlux
				.concatWith(Flux.just("[DONE]")) // ✅ 끝에 종료 토큰 추가
				.subscribe(
				token -> messagingTemplate.convertAndSendToUser(
					username,
					"/sub/chat/stream",
					token
				),
				error -> {
					log.error("❌ Chat stream 처리 중 에러", error);
					messagingTemplate.convertAndSendToUser(
						username,
						"/sub/chat/stream",
						"[에러] 챗봇 응답 중 문제가 발생했습니다."
					);
				}
			);
		} catch (Exception e) {
			log.error("❌ WebSocket 처리 전체 예외", e);
		}
	}
}
