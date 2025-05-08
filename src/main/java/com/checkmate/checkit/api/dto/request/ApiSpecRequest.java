package com.checkmate.checkit.api.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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

    private List<DtoRequest> dtoList;  // body일 경우만 전달
}
