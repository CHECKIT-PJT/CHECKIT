package com.checkmate.checkit.erd.mapper;

import com.checkmate.checkit.erd.dto.request.ErdRelationshipRequest;
import com.checkmate.checkit.erd.dto.request.ErdTableRequest;
import com.checkmate.checkit.erd.dto.response.*;
import com.checkmate.checkit.erd.entity.ErdColumnEntity;
import com.checkmate.checkit.erd.entity.ErdRelationshipColumnEntity;
import com.checkmate.checkit.erd.entity.ErdRelationshipEntity;
import com.checkmate.checkit.erd.entity.ErdTableEntity;
import com.checkmate.checkit.project.entity.ProjectEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

public class ErdMapper {

    public static ErdSnapshotResponse toSnapshotResponseDto(
            List<ErdTableEntity> tables,
            List<ErdColumnEntity> allColumns,
            List<ErdRelationshipEntity> relationships,
            List<ErdRelationshipColumnEntity> allRelationshipColumns
    ) {
        
        Map<UUID, List<ErdColumnEntity>> columnMap = allColumns.stream()
                .collect(Collectors.groupingBy(c -> c.getTable().getId()));

        List<ErdTableResponse> tableDtos = tables.stream().map(t -> new ErdTableResponse(
                t.getId(),
                t.getTblLogicName(),
                t.getTblPhysicName(),
                t.getPositionX(),
                t.getPositionY(),
                columnMap.getOrDefault(t.getId(), new ArrayList<>()).stream().map(c -> new ErdColumnResponse(
                        c.getId(),
                        c.getColLogicName(),
                        c.getColPhysicName(),
                        c.getDataType(),
                        c.isPrimaryKey(),
                        c.isNullable(),
                        c.getDefaultValue()
                )).toList()
        )).toList();

        // 관계 ID로 relationshipColumns 그룹핑
        Map<UUID, List<ErdRelationshipColumnEntity>> relationshipColumnMap = allRelationshipColumns.stream()
                .collect(Collectors.groupingBy(rc -> rc.getRelationship().getId()));

        List<ErdRelationshipResponse> relationshipDtos = relationships.stream().map(r -> new ErdRelationshipResponse(
                r.getId(),
                r.getSourceTable().getId(),
                r.getTargetTable().getId(),
                r.getRelationshipType(),
                r.getLogicalName(),
                relationshipColumnMap.getOrDefault(r.getId(), new ArrayList<>()).stream().map(rc -> new ErdRelationshipColumnResponse(
                        rc.getId(),
                        rc.getSourceColumn().getId(),
                        rc.getTargetColumn().getId()
                )).toList()
        )).toList();

        return new ErdSnapshotResponse(tableDtos, relationshipDtos);
    }


    public static List<ErdTableEntity> toTableEntities(List<ErdTableRequest> tableDtos, ProjectEntity project) {
        return tableDtos.stream().map(t -> {
            ErdTableEntity table = new ErdTableEntity();
            table.setId(t.getId());
            table.setTblLogicName(t.getTblLogicName());
            table.setTblPhysicName(t.getTblPhysicName());
            table.setPositionX(t.getPositionX());
            table.setPositionY(t.getPositionY());
            table.setProject(project);
            return table;
        }).toList();
    }

    public static List<ErdColumnEntity> toColumnEntities(List<ErdTableRequest> tableDtos, List<ErdTableEntity> tableEntities) {
        Map<UUID, ErdTableEntity> tableMap = tableEntities.stream().collect(Collectors.toMap(ErdTableEntity::getId, t -> t));
        return tableDtos.stream().flatMap(t -> t.getColumns().stream().map(c -> {
            ErdColumnEntity col = new ErdColumnEntity();
            col.setId(c.getId());
            col.setColLogicName(c.getColLogicName());
            col.setColPhysicName(c.getColPhysicName());
            col.setDataType(c.getDataType());
            col.setPrimaryKey(c.isPrimaryKey());
            col.setNullable(c.isNullable());
            col.setDefaultValue(c.getDefaultValue());
            col.setTable(tableMap.get(t.getId()));
            return col;
        })).toList();
    }

    public static List<ErdRelationshipEntity> toRelationshipEntities(List<ErdRelationshipRequest> relationshipDtos, Map<UUID, ErdTableEntity> tableMap, ProjectEntity project) {
        return relationshipDtos.stream().map(r -> {
            ErdRelationshipEntity entity = new ErdRelationshipEntity();
            entity.setId(r.getId());
            entity.setSourceTable(tableMap.get(r.getSourceTableId()));
            entity.setTargetTable(tableMap.get(r.getTargetTableId()));
            entity.setRelationshipType(r.getRelationshipType());
            entity.setLogicalName(r.getLogicalName());
            entity.setProject(project);
            return entity;
        }).toList();
    }

    public static List<ErdRelationshipColumnEntity> toRelationshipColumnEntities(List<ErdRelationshipRequest> relationshipDtos, List<ErdRelationshipEntity> relationshipEntities,
                                                                                 Map<UUID, ErdColumnEntity> columnMap) {
        Map<UUID, ErdRelationshipEntity> relMap = relationshipEntities.stream().collect(Collectors.toMap(ErdRelationshipEntity::getId, r -> r));
        return relationshipDtos.stream().flatMap(r -> r.getRelationshipColumns().stream().map(rc -> {
            ErdRelationshipColumnEntity entity = new ErdRelationshipColumnEntity();
            entity.setId(rc.getId());
            entity.setSourceColumn(columnMap.get(rc.getSourceColumnId()));
            entity.setTargetColumn(columnMap.get(rc.getTargetColumnId()));
            entity.setRelationship(relMap.get(r.getId()));
            return entity;
        })).toList();
    }
}
