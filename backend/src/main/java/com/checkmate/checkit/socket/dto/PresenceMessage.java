package com.checkmate.checkit.socket.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PresenceMessage {
    private String resourceId;
    private ActionType action;

    public enum ActionType {
        ENTER, LEAVE
    }
}
