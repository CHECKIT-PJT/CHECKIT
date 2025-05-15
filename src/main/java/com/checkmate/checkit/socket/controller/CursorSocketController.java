package com.checkmate.checkit.socket.controller;

import com.checkmate.checkit.socket.dto.CursorPositionMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class CursorSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/cursor/{projectId}/{pageType}")
    public void sendCursorPosition(@DestinationVariable Long projectId,
                                   @DestinationVariable String pageType,
                                   CursorPositionMessage message,
                                   Principal principal) {
        messagingTemplate.convertAndSend("/sub/cursor/" + projectId + "/" + pageType, message);
    }
}