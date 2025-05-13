package com.checkmate.checkit.functional.dto.response;

import com.checkmate.checkit.functional.entity.FunctionalSpec;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FunctionalSpecResponse {

    private int id;
    private int projectId;
    private int userId;
    private String userName; // 선택사항
    private String category;
    private String functionName;
    private String functionDescription;
    private Integer priority;
    private String successCase;
    private String failCase;
    private int storyPoint;

    public static FunctionalSpecResponse from(FunctionalSpec spec) {
        return FunctionalSpecResponse.builder()
                .id(spec.getId())
                .projectId(spec.getProject().getId())
                .userId(spec.getUser().getId())
                .userName(spec.getUser().getUserName()) // 필요에 따라 생략 가능
                .category(spec.getCategory())
                .functionName(spec.getFunctionName())
                .functionDescription(spec.getFunctionDescription())
                .priority(spec.getPriority())
                .successCase(spec.getSuccessCase())
                .failCase(spec.getFailCase())
                .storyPoint(spec.getStoryPoint())
                .build();
    }
}