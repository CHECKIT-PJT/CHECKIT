package com.checkmate.checkit.socket.controller;

import com.checkmate.checkit.socket.PresenceTracker;
import com.checkmate.checkit.socket.dto.PresenceBroadcastMessage;
import com.checkmate.checkit.socket.dto.PresenceMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j
public class PresenceSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final PresenceTracker tracker;

    @MessageMapping("/presence")
    public void handlePresence(PresenceMessage message, Principal principal) {
        String userId = principal.getName();
        String resourceId = message.getResourceId();

        log.info("User [{}] {} [{}]", userId, message.getAction(), resourceId);

        if (message.getAction() == PresenceMessage.ActionType.ENTER) {
            tracker.enter(resourceId, userId);
        } else {
            tracker.leave(resourceId, userId);
        }

        PresenceBroadcastMessage response = new PresenceBroadcastMessage();
        response.setResourceId(resourceId);
        response.setUsers(tracker.getUsers(resourceId));

        messagingTemplate.convertAndSend("/sub/presence/" + resourceId, response);
    }
}