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
public class ErdColumnRequest {
    private UUID id;
    private String colLogicName;
    private String colPhysicName;
    private String dataType;
    private boolean isPrimaryKey;
    private boolean isNullable;
    private String defaultValue;
}