package com.checkmate.checkit.api.service;

import com.checkmate.checkit.api.dto.request.*;
import com.checkmate.checkit.api.dto.response.ApiSpecResponse;
import com.checkmate.checkit.api.entity.*;
import com.checkmate.checkit.api.repository.*;
import com.checkmate.checkit.project.entity.ProjectEntity;
import com.checkmate.checkit.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApiSpecService {

    private final ApiSpecRepository apiSpecRepository;
    private final ApiQueryStringRepository queryStringRepository;
    private final ApiPathVariableRepository pathVariableRepository;
    private final DtoRepository dtoRepository;
    private final DtoItemRepository dtoItemRepository;
    private final ProjectRepository projectRepository;

    @Transactional
    public void saveApiSpec(int projectId, ApiSpecRequest request) {
        ApiSpecEntity spec;

        if (request.getId() != null) {
            spec = apiSpecRepository.findById(request.getId())
                    .orElseThrow(() -> new RuntimeException("해당 API 명세가 존재하지 않습니다."));

            spec = ApiSpecEntity.builder()
                    .apiName(request.getApiName())
                    .endpoint(request.getEndpoint())
                    .method(ApiSpecEntity.HttpMethod.valueOf(request.getMethod()))
                    .category(request.getCategory())
                    .description(request.getDescription())
                    .statusCode(request.getStatusCode())
                    .header(request.getHeader())
                    .updatedAt(LocalDateTime.now())
                    .build();

            queryStringRepository.deleteByApiSpec(spec);
            pathVariableRepository.deleteByApiSpec(spec);
            dtoRepository.findByApiSpecId(spec.getId()).forEach(dto -> {
                dtoItemRepository.deleteByDto(dto);
                dtoRepository.delete(dto);
            });

        } else {
            ProjectEntity project = projectRepository.findByIdAndIsDeletedFalse(projectId)
                    .orElseThrow(() -> new RuntimeException("프로젝트가 존재하지 않습니다."));

            spec = apiSpecRepository.save(ApiSpecEntity.builder()
                    .project(project)
                    .apiName(request.getApiName())
                    .endpoint(request.getEndpoint())
                    .method(ApiSpecEntity.HttpMethod.valueOf(request.getMethod()))
                    .category(request.getCategory())
                    .description(request.getDescription())
                    .statusCode(request.getStatusCode())
                    .header(request.getHeader())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .isDeleted(false)
                    .build()
            );
        }

        final ApiSpecEntity finalSpec = spec;

        if (request.getQueryStrings() != null) {
            request.getQueryStrings().forEach(q ->
                    queryStringRepository.save(ApiQueryStringEntity.builder()
                            .apiSpec(finalSpec)
                            .queryStringVariable(q.getQueryStringVariable())
                            .queryStringDataType(q.getQueryStringDataType())
                            .build())
            );
        }

        if (request.getPathVariables() != null) {
            request.getPathVariables().forEach(p ->
                    pathVariableRepository.save(ApiPathVariableEntity.builder()
                            .apiSpec(finalSpec)
                            .pathVariable(p.getPathVariable())
                            .pathVariableDataType(p.getPathVariableDataType())
                            .build())
            );
        }

        if (request.getDtoList() != null) {
            request.getDtoList().forEach(dto -> {
                DtoEntity savedDto = dtoRepository.save(DtoEntity.builder()
                        .apiSpec(finalSpec)
                        .dtoName(dto.getDtoName())
                        .dtoType(dto.getDtoType())
                        .build());

                dto.getFields().forEach(field ->
                        dtoItemRepository.save(DtoItemEntity.builder()
                                .dto(savedDto)
                                .dtoItemName(field.getDtoItemName())
                                .dataType(field.getDataType())
                                .isList(field.getIsList())
                                .build())
                );
            });
        }
    }

    @Transactional(readOnly = true)
    public List<ApiSpecResponse> getApiSpecsByProjectId(Long projectId) {
        List<ApiSpecEntity> specs = apiSpecRepository.findByProjectId(projectId);

        return specs.stream().map(spec -> {
            List<QueryStringRequest> queryStrings = queryStringRepository.findByApiSpec(spec)
                    .stream().map(q -> new QueryStringRequest(q.getId(), q.getQueryStringVariable(), q.getQueryStringDataType()))
                    .toList();

            List<PathVariableRequest> pathVars = pathVariableRepository.findByApiSpec(spec)
                    .stream().map(p -> new PathVariableRequest(p.getId(), p.getPathVariable(), p.getPathVariableDataType()))
                    .toList();

            List<DtoEntity> dtoEntities = dtoRepository.findByApiSpecId(spec.getId());
            List<DtoRequest> dtoList = dtoEntities.stream().map(dto -> {
                List<DtoItemEntity> items = dtoItemRepository.findByDto(dto);
                List<DtoItemRequest> fields = items.stream()
                        .map(i -> new DtoItemRequest(i.getId(), i.getDtoItemName(), i.getDataType(), i.getIsList()))
                        .toList();
                return new DtoRequest(dto.getId(), dto.getDtoName(), dto.getDtoType(), fields);
            }).toList();

            return ApiSpecResponse.builder()
                    .id(spec.getId())
                    .apiName(spec.getApiName())
                    .endpoint(spec.getEndpoint())
                    .method(spec.getMethod().name())
                    .category(spec.getCategory())
                    .description(spec.getDescription())
                    .statusCode(spec.getStatusCode())
                    .header(spec.getHeader())
                    .queryStrings(queryStrings)
                    .pathVariables(pathVars)
                    .dtoList(dtoList)
                    .build();
        }).toList();
    }

    @Transactional
    public ApiSpecResponse getApiSpecsByProjectIdandApiScepId(Long projectId, Long apiSpecId){
        ApiSpecEntity spec = apiSpecRepository.findByIdAndProjectId(apiSpecId, projectId)
                .orElseThrow(() -> new RuntimeException("해당 API 명세가 존재하지 않습니다."));

        List<QueryStringRequest> queryStrings = queryStringRepository.findByApiSpec(spec)
                .stream()
                .map(q -> new QueryStringRequest(q.getId(), q.getQueryStringVariable(), q.getQueryStringDataType()))
                .toList();

        List<PathVariableRequest> pathVars = pathVariableRepository.findByApiSpec(spec)
                .stream()
                .map(p -> new PathVariableRequest(p.getId(), p.getPathVariable(), p.getPathVariableDataType()))
                .toList();

        List<DtoEntity> dtoEntities = dtoRepository.findByApiSpecId(spec.getId());
        List<DtoRequest> dtoList = dtoEntities.stream().map(dto -> {
            List<DtoItemEntity> items = dtoItemRepository.findByDto(dto);
            List<DtoItemRequest> fields = items.stream()
                    .map(i -> new DtoItemRequest(i.getId(), i.getDtoItemName(), i.getDataType(), i.getIsList()))
                    .toList();
            return new DtoRequest(dto.getId(), dto.getDtoName(), dto.getDtoType(), fields);
        }).toList();

        return ApiSpecResponse.builder()
                .id(spec.getId())
                .apiName(spec.getApiName())
                .endpoint(spec.getEndpoint())
                .method(spec.getMethod().name())
                .category(spec.getCategory())
                .description(spec.getDescription())
                .statusCode(spec.getStatusCode())
                .header(spec.getHeader())
                .queryStrings(queryStrings)
                .pathVariables(pathVars)
                .dtoList(dtoList)
                .build();
    }

    @Transactional
    public void deleteApiSpec(Long specId) {
        ApiSpecEntity spec = apiSpecRepository.findById(specId)
                .orElseThrow(() -> new RuntimeException("삭제할 API 명세가 존재하지 않습니다."));

        queryStringRepository.deleteByApiSpec(spec);
        pathVariableRepository.deleteByApiSpec(spec);
        dtoRepository.findByApiSpecId(spec.getId()).forEach(dto -> {
            dtoItemRepository.deleteByDto(dto);
            dtoRepository.delete(dto);
        });

        apiSpecRepository.delete(spec);
    }
}