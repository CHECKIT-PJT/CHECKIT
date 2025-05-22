package com.checkmate.checkit.socket.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CursorPositionMessage {
    private String userId;
    private double x;
    private double y;
    private String pageType;   // "erd", "api", "function", etc
    private String detailId;   // e.g., apiId 등 (null 허용)
}