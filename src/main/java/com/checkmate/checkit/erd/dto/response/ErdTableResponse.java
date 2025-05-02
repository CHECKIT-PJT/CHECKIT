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
public class ErdTableResponse {
    private UUID id;
    private String tblLogicName;
    private String tblPhysicName;
    private int positionX;
    private int positionY;
    private List<ErdColumnResponse> columns;
}

