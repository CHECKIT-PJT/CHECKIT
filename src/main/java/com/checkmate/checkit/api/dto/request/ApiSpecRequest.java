package com.checkmate.checkit.api.dto.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ApiSpecRequest {
    private Long id;
    private String apiName;
    private String endpoint;
    private String method;
    private String category;
    private String description;
    private Integer statusCode;
    private String header;

    private List<QueryStringRequest> queryStrings;
    private List<PathVariableRequest> pathVariables;

    private List<DtoRequest> dtoList;
}
