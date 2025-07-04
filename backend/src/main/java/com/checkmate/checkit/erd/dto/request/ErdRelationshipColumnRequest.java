package com.checkmate.checkit.erd.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ErdRelationshipColumnRequest {
    private UUID id;
    private UUID sourceColumnId;
    private UUID targetColumnId;
}
