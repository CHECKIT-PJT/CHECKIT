package com.checkmate.checkit.api.dto;

import com.checkmate.checkit.api.dto.response.ApiSpecSocketResponse;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ApiSpecSocketMessage {
    private Long projectId;
    private ActionType action; // CREATE, UPDATE, DELETE
    private ApiSpecSocketResponse apiSpec;

    public enum ActionType {
        CREATE, UPDATE, DELETE
    }
}