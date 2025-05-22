package com.checkmate.checkit.functional.entity;

import com.checkmate.checkit.functional.dto.request.FunctionalSpecCreateRequest;
import com.checkmate.checkit.functional.dto.request.FunctionalSpecUpdateRequest;
import com.checkmate.checkit.global.common.entity.BaseEntity;
import com.checkmate.checkit.project.entity.ProjectEntity;
import com.checkmate.checkit.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "Functional_spec")
@Builder
public class FunctionalSpec extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private ProjectEntity project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "category", nullable = false, length = 100)
    private String category;

    @Column(name = "function_name", nullable = false, length = 100)
    private String functionName;

    @Column(name = "function_description", nullable = false, length = 100)
    private String functionDescription;

    @Column(name = "priority")
    private int priority; // nullable 가능, TINYINT

    @Column(name = "success_case", length = 255)
    private String successCase;

    @Column(name = "fail_case", length = 1000)
    private String failCase;

    @Column(name = "story_point", nullable = false)
    private int storyPoint;

    public void updateFrom(FunctionalSpecUpdateRequest request, User user) {
        if (user != null) this.user = user;
        if (request.getCategory() != null) this.category = request.getCategory();
        if (request.getFunctionName() != null) this.functionName = request.getFunctionName();
        if (request.getFunctionDescription() != null) this.functionDescription = request.getFunctionDescription();
        if (request.getPriority() != null) this.priority = request.getPriority();
        if (request.getSuccessCase() != null) this.successCase = request.getSuccessCase();
        if (request.getFailCase() != null) this.failCase = request.getFailCase();
        if (request.getStoryPoint() != null) this.storyPoint = request.getStoryPoint();
    }
}
