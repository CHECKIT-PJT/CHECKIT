package com.checkmate.checkit.api.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DtoItemRequest {
    private Long id;
    private String dtoItemName;
    private String dataType;
    private Boolean isList;
}
