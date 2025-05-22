package com.checkmate.checkit.api.dto.response;

import com.checkmate.checkit.api.dto.request.DtoRequest;
import com.checkmate.checkit.api.dto.request.PathVariableRequest;
import com.checkmate.checkit.api.dto.request.QueryStringRequest;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ApiSpecSocketResponse {
    private Long id;
    private String tempKey;
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
