package com.checkmate.checkit.api.dto;

import com.checkmate.checkit.api.dto.response.ApiSpecResponse;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiSpecSocketMessage {
    private Long projectId;
    private ActionType action; // CREATE, UPDATE, DELETE
    private ApiSpecResponse apiSpec;

    public enum ActionType {
        CREATE, UPDATE, DELETE
    }
}