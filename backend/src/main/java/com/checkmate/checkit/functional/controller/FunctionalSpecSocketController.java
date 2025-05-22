package com.checkmate.checkit.functional.controller;

import com.checkmate.checkit.functional.dto.socket.FunctionalSpecSocketMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class FunctionalSpecSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/function/update/{projectId}")
    public void handleFunctionUpdate(@DestinationVariable Integer projectId,
                                     FunctionalSpecSocketMessage message) {
        log.info("message " + message.toString());
        messagingTemplate.convertAndSend("/sub/function/" + projectId, message);
    }
}
