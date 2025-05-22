package com.checkmate.checkit.api.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class PathVariableRequest {
    private Long id;
    private String pathVariable;
    private String pathVariableDataType;
}
