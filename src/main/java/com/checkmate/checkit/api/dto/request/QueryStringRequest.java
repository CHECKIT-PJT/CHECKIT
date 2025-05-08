package com.checkmate.checkit.api.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QueryStringRequest {
    private Long id;
    private String queryStringVariable;
    private String queryStringDataType;
}
