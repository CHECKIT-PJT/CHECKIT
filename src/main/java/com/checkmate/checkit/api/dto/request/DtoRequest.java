package com.checkmate.checkit.api.dto.request;

import com.checkmate.checkit.api.entity.DtoEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DtoRequest {
    private Long id;
    private String dtoName;
    private DtoEntity.DtoType dtoType;
    private List<DtoItemRequest> fields;
}
