package com.checkmate.checkit.erd.service;

import com.checkmate.checkit.erd.dto.request.ErdSnapshotRequest;
import com.checkmate.checkit.erd.dto.response.ErdSnapshotResponse;
import com.checkmate.checkit.erd.entity.ErdColumnEntity;
import com.checkmate.checkit.erd.entity.ErdRelationshipColumnEntity;
import com.checkmate.checkit.erd.entity.ErdRelationshipEntity;
import com.checkmate.checkit.erd.entity.ErdTableEntity;
import com.checkmate.checkit.erd.mapper.ErdMapper;
import com.checkmate.checkit.erd.repository.ErdColumnRepository;
import com.checkmate.checkit.erd.repository.ErdRelationshipColumnRepository;
import com.checkmate.checkit.erd.repository.ErdRelationshipRepository;
import com.checkmate.checkit.erd.repository.ErdTableRepository;
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

    private final ErdTableRepository tableRepository;
    private final ErdColumnRepository columnRepository;
    private final ErdRelationshipRepository relationshipRepository;
    private final ErdRelationshipColumnRepository relationshipColumnRepository;
    private final ProjectRepository projectRepository;

    public ErdSnapshotResponse getErdByProjectId(int projectId) {
        List<ErdTableEntity> tables = tableRepository.findAllByProjectId(projectId);
        List<ErdColumnEntity> columns = columnRepository.findAllByTableIn(tables);
        List<ErdRelationshipEntity> relationships = relationshipRepository.findAllByProjectId(projectId);
        List<ErdRelationshipColumnEntity> relationshipColumns = relationshipColumnRepository.findAllByRelationshipIn(relationships);

        return ErdMapper.toSnapshotResponseDto(tables, columns, relationships, relationshipColumns);
    }

    @Transactional
    public void saveErd(int projectId, ErdSnapshotRequest dto) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        List<ErdTableEntity> tables = ErdMapper.toTableEntities(dto.getTables(), project);
        tableRepository.saveAll(tables);

        List<ErdColumnEntity> columns = ErdMapper.toColumnEntities(dto.getTables(), tables);
        columnRepository.saveAll(columns);

        Map<UUID, ErdTableEntity> tableMap = tables.stream()
                .collect(Collectors.toMap(ErdTableEntity::getId, Function.identity()));

        List<ErdRelationshipEntity> relationships = ErdMapper.toRelationshipEntities(dto.getRelationships(), tableMap, project);
        relationshipRepository.saveAll(relationships);

        Map<UUID, ErdColumnEntity> columnMap = columns.stream()
                .collect(Collectors.toMap(ErdColumnEntity::getId, Function.identity()));

        List<ErdRelationshipColumnEntity> relColumns = ErdMapper.toRelationshipColumnEntities(dto.getRelationships(), relationships, columnMap);
        relationshipColumnRepository.saveAll(relColumns);
    }
}
