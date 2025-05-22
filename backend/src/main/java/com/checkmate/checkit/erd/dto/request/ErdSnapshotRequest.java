package com.checkmate.checkit.erd.dto.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ErdSnapshotRequest {
    private String erdJson;
}
