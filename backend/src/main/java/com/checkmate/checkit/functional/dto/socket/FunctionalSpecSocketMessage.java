package com.checkmate.checkit.functional.dto.socket;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class FunctionalSpecSocketMessage {
    private Integer projectId;
    private String action; // CREATE, UPDATE, DELETE
    private FunctionalSpecDto functionalSpec;
}
