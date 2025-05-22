package com.checkmate.checkit.erd.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ErdRelationshipRequest {
    private UUID id;
    private UUID sourceTableId;
    private UUID targetTableId;
    private String relationshipType;
    private String logicalName;
    private List<ErdRelationshipColumnRequest> relationshipColumns;
}