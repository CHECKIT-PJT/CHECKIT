package com.checkmate.checkit.erd.controller;

import com.checkmate.checkit.erd.dto.ErdActionMessage;
import com.checkmate.checkit.erd.dto.request.ErdSnapshotRequest;
import com.checkmate.checkit.erd.service.ErdService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
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
    private final ErdService erdService;

    @MessageMapping("/erd/update/{projectId}")
    public void receiveErdAction(@DestinationVariable int projectId,
                                 @Payload String message,
                                 Principal principal) {
        String userId = principal.getName();
        log.info("{} updated ERD for project {}", userId, projectId);
        log.info("message : " + message);
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode msg = mapper.createObjectNode();
        msg.put("userId", userId);
        msg.put("payload", message);


        ErdSnapshotRequest request = new ErdSnapshotRequest(message);

        erdService.saveErd(projectId, request);
        messagingTemplate.convertAndSend("/sub/erd/" + projectId, msg);
    }
}
