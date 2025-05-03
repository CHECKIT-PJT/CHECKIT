package com.checkmate.checkit.erd.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ErdSnapshotRequest {
    private List<ErdTableRequest> tables;
    private List<ErdRelationshipRequest> relationships;
}
