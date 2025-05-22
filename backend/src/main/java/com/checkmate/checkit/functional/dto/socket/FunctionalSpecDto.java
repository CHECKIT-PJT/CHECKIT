package com.checkmate.checkit.functional.dto.socket;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class FunctionalSpecDto {
    private Integer id;
    private Integer projectId;
    private Integer userId;
    private String userName;
    private String category;
    private String functionName;
    private String functionDescription;
    private Integer priority;
    private String successCase;
    private String failCase;
    private Integer storyPoint;
}