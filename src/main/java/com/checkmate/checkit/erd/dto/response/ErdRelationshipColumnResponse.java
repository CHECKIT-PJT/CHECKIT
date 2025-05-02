package com.checkmate.checkit.erd.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ErdRelationshipColumnResponse {
    private UUID id;
    private UUID sourceColumnId;
    private UUID targetColumnId;
}
