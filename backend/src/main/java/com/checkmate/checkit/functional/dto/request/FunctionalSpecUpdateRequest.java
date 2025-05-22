package com.checkmate.checkit.functional.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Setter
public class FunctionalSpecUpdateRequest {
    private Integer id;
    private Integer projectId;
    private Integer userId;
    private String category;
    private String functionName;
    private String functionDescription;
    private Integer priority;
    private String successCase;
    private String failCase;
    private Integer storyPoint;
}
