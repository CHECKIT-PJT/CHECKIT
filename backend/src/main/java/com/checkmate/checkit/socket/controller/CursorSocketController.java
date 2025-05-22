package com.checkmate.checkit.socket.controller;

import com.checkmate.checkit.socket.dto.CursorPositionMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@RequiredArgsConstructor
@Controller
public class CursorSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    // 기존 구조 지원
    @MessageMapping("/cursor/{projectId}/{pageType}")
    public void handleCursor(@DestinationVariable String projectId,
                             @DestinationVariable String pageType,
                             CursorPositionMessage message) {
        messagingTemplate.convertAndSend(
                "/sub/cursor/" + projectId + "/" + pageType,
                message
        );
    }

    // 상세 페이지 구조 추가
    @MessageMapping("/cursor/{projectId}/{pageType}/{detailId}")
    public void handleDetailedCursor(@DestinationVariable String projectId,
                                     @DestinationVariable String pageType,
                                     @DestinationVariable String detailId,
                                     CursorPositionMessage message) {
        messagingTemplate.convertAndSend(
                "/sub/cursor/" + projectId + "/" + pageType + "/" + detailId,
                message
        );
    }
}