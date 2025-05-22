package com.checkmate.checkit.socket.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class PresenceBroadcastMessage {
    private String resourceId;
    private Set<String> users;
}