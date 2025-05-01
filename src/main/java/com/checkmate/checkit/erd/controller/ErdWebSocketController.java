package com.checkmate.checkit.erd.controller;

import com.checkmate.checkit.erd.dto.ErdActionMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ErdWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 클라이언트에서 ERD 액션을 보낼 때 (예: 테이블 추가, 컬럼 수정 등)
     */
    @MessageMapping("/erd/update/{projectId}")
    public void receiveErdAction(@DestinationVariable int projectId,
                                 @Payload ErdActionMessage message,
                                 Principal principal) {
        String userId = principal.getName();
        log.info("🔄 {} updated ERD for project {}", userId, projectId);

        messagingTemplate.convertAndSend("/sub/erd/" + projectId, message);
    }
}
