package com.checkmate.checkit.erd.service;

import com.checkmate.checkit.erd.dto.request.ErdSnapshotRequest;
import com.checkmate.checkit.erd.dto.response.ErdSnapshotResponse;
import com.checkmate.checkit.erd.entity.*;
import com.checkmate.checkit.erd.repository.*;
import com.checkmate.checkit.project.entity.ProjectEntity;
import com.checkmate.checkit.project.repository.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ErdService {

//    private final ErdTableRepository tableRepository;
//    private final ErdColumnRepository columnRepository;
//    private final ErdRelationshipRepository relationshipRepository;
//    private final ErdRelationshipColumnRepository relationshipColumnRepository;
    private final ProjectRepository projectRepository;
    private final ErdSnapshotRepository erdSnapshotRepository;

    public ErdSnapshotResponse getErdByProjectId(int projectId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        ErdSnapshot snapshot = erdSnapshotRepository.findByProject(project)
                .orElse(null);

        ErdSnapshotResponse response = new ErdSnapshotResponse(snapshot.getErdJson());
        return response;
    }

    @Transactional
    public void saveErd(int projectId, ErdSnapshotRequest dto) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        ErdSnapshot snapshot = erdSnapshotRepository.findByProject(project)
                .orElse(null);

        if (snapshot == null) {
            snapshot = ErdSnapshot.builder()
                    .project(project)
                    .erdJson(dto.getErdJson())
                    .build();
        } else {
            snapshot.updateErdJson(dto.getErdJson());
        }

        erdSnapshotRepository.save(snapshot);
    }
}
