package com.checkmate.checkit.erd.dto.response;

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
public class ErdRelationshipResponse {
    private UUID id;
    private UUID sourceTableId;
    private UUID targetTableId;
    private String relationshipType;
    private String logicalName;
    private List<ErdRelationshipColumnResponse> relationshipColumns;
}
