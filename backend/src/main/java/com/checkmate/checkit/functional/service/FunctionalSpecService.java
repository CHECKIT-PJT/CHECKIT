package com.checkmate.checkit.functional.service;

import com.checkmate.checkit.functional.dto.request.FunctionalSpecCreateRequest;
import com.checkmate.checkit.functional.dto.request.FunctionalSpecUpdateRequest;
import com.checkmate.checkit.functional.dto.response.FunctionalSpecResponse;
import com.checkmate.checkit.functional.entity.FunctionalSpec;
import com.checkmate.checkit.functional.repository.FunctionalSpecRepository;
import com.checkmate.checkit.project.entity.ProjectEntity;
import com.checkmate.checkit.project.repository.ProjectRepository;
import com.checkmate.checkit.user.entity.User;
import com.checkmate.checkit.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FunctionalSpecService {

    private final FunctionalSpecRepository functionalSpecRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<FunctionalSpecResponse> getSpecsByProject(int projectId) {
        return functionalSpecRepository.findByProjectIdAndIsDeletedFalse(projectId).stream()
                .map(FunctionalSpecResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteSpec(int specId) {
        FunctionalSpec spec = functionalSpecRepository.findById(specId)
                .orElseThrow(() -> new IllegalArgumentException("기능 명세서를 찾을 수 없습니다."));

        spec.delete();
    }

    @Transactional
    public FunctionalSpecResponse createSpec(FunctionalSpecCreateRequest request) {
        ProjectEntity project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        FunctionalSpec spec = FunctionalSpec.builder()
                .project(project)
                .user(user)
                .category(request.getCategory())
                .functionName(request.getFunctionName())
                .functionDescription(request.getFunctionDescription())
                .priority(request.getPriority())
                .successCase(request.getSuccessCase())
                .failCase(request.getFailCase())
                .storyPoint(request.getStoryPoint() != null ? request.getStoryPoint() : 0)
                .build();

        functionalSpecRepository.save(spec);
        return FunctionalSpecResponse.from(spec);
    }

    @Transactional
    public FunctionalSpecResponse updateSpec(FunctionalSpecUpdateRequest request) {
        FunctionalSpec spec = functionalSpecRepository.findById(request.getId())
                .orElseThrow(() -> new IllegalArgumentException("기능 명세서를 찾을 수 없습니다."));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        spec.updateFrom(request,user);

        return FunctionalSpecResponse.from(spec);
    }
}
