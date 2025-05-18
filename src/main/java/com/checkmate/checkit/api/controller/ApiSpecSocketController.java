package com.checkmate.checkit.api.controller;


import com.checkmate.checkit.api.dto.ApiSpecSocketMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Payload;
@Controller
@RequiredArgsConstructor
@Slf4j
public class ApiSpecSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/spec/update/{projectId}")
    public void handleApiSpecUpdate(@DestinationVariable Long projectId,
                                    @Payload ApiSpecSocketMessage message) {
        log.info(message.toString());
        messagingTemplate.convertAndSend("/sub/spec/" + projectId, message);
    }
}
