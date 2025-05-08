package com.checkmate.checkit.api.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PathVariableRequest {
    private Long id;
    private String pathVariable;
    private String pathVariableDataType;
}
