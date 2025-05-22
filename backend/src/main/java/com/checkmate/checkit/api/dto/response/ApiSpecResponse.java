package com.checkmate.checkit.api.dto.response;

import com.checkmate.checkit.api.dto.request.DtoItemRequest;
import com.checkmate.checkit.api.dto.request.DtoRequest;
import com.checkmate.checkit.api.dto.request.PathVariableRequest;
import com.checkmate.checkit.api.dto.request.QueryStringRequest;
import com.checkmate.checkit.api.entity.*;
import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiSpecResponse {

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

    public static ApiSpecResponse from(ApiSpecEntity spec,
                                       List<ApiQueryStringEntity> queryStrings,
                                       List<ApiPathVariableEntity> pathVariables,
                                       List<DtoEntity> dtoEntities,
                                       Map<Long, List<DtoItemEntity>> dtoItemMap) {
        return ApiSpecResponse.builder()
                .id(spec.getId())
                .apiName(spec.getApiName())
                .endpoint(spec.getEndpoint())
                .method(spec.getMethod().name())
                .category(spec.getCategory())
                .description(spec.getDescription())
                .statusCode(spec.getStatusCode())
                .header(spec.getHeader())
                .queryStrings(queryStrings.stream()
                        .map(q -> new QueryStringRequest(q.getId(), q.getQueryStringVariable(), q.getQueryStringDataType()))
                        .toList())
                .pathVariables(pathVariables.stream()
                        .map(p -> new PathVariableRequest(p.getId(), p.getPathVariable(), p.getPathVariableDataType()))
                        .toList())
                .dtoList(dtoEntities.stream()
                        .map(dto -> new DtoRequest(
                                dto.getId(),
                                dto.getDtoName(),
                                dto.getDtoType(),
                                dtoItemMap.getOrDefault(dto.getId(), List.of()).stream()
                                        .map(item -> new DtoItemRequest(item.getId(), item.getDtoItemName(), item.getDataType(), item.getIsList()))
                                        .toList()
                        ))
                        .toList())
                .build();
    }

}