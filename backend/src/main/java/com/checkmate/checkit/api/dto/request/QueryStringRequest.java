package com.checkmate.checkit.api.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class QueryStringRequest {
    private Long id;
    private String queryStringVariable;
    private String queryStringDataType;
}
