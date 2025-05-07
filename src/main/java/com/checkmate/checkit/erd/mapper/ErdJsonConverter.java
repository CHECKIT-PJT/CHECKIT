package com.checkmate.checkit.erd.mapper;

import com.checkmate.checkit.erd.dto.request.ErdRelationshipRequest;
import com.checkmate.checkit.erd.dto.request.ErdTableRequest;
import com.checkmate.checkit.erd.dto.response.*;
import com.checkmate.checkit.erd.entity.ErdColumnEntity;
import com.checkmate.checkit.erd.entity.ErdRelationshipColumnEntity;
import com.checkmate.checkit.erd.entity.ErdRelationshipEntity;
import com.checkmate.checkit.erd.entity.ErdTableEntity;
import com.checkmate.checkit.project.entity.ProjectEntity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.Setter;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;
public class ErdJsonConverter {

    @Getter
    @Setter
    public static class ErdSnapshotDto {
        private List<ErdTableResponse> tables;
        private List<ErdRelationshipResponse> relationships;
    }

    public static ErdSnapshotDto convertFromJson(String jsonString) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(jsonString);

        JsonNode tableEntities = root.path("collections").path("tableEntities");
        JsonNode columnEntities = root.path("collections").path("tableColumnEntities");
        JsonNode relationshipEntities = root.path("collections").path("relationshipEntities");

        Map<String, ErdColumnResponse> columnMap = new HashMap<>();
        for (Iterator<String> it = columnEntities.fieldNames(); it.hasNext(); ) {
            String colId = it.next();
            JsonNode colNode = columnEntities.get(colId);
            ErdColumnResponse col = new ErdColumnResponse();
            col.setId(UUID.fromString(colId));
            col.setColPhysicName(colNode.path("name").asText());
            col.setColLogicName(colNode.path("comment").asText());
            col.setDataType(colNode.path("dataType").asText());
            col.setDefaultValue(colNode.path("default").asText());
            col.setPrimaryKey(colNode.path("options").asInt() == 10 || colNode.path("ui").path("keys").asInt() == 1);
            col.setNullable(!colNode.path("options").toString().contains("notNull"));
            columnMap.put(colId, col);
        }

        List<ErdTableResponse> tables = new ArrayList<>();
        for (Iterator<String> it = tableEntities.fieldNames(); it.hasNext(); ) {
            String tblId = it.next();
            JsonNode tblNode = tableEntities.get(tblId);
            ErdTableResponse tbl = new ErdTableResponse();
            tbl.setId(UUID.fromString(tblId));
            tbl.setTblPhysicName(tblNode.path("name").asText());
            tbl.setTblLogicName(tblNode.path("comment").asText());
            tbl.setPositionX(tblNode.path("ui").path("x").asInt());
            tbl.setPositionY(tblNode.path("ui").path("y").asInt());

            List<ErdColumnResponse> cols = new ArrayList<>();
            JsonNode columnIds = tblNode.path("columnIds");
            for (JsonNode colId : columnIds) {
                ErdColumnResponse col = columnMap.get(colId.asText());
                if (col != null) {
                    cols.add(col);
                }
            }
            tbl.setColumns(cols);
            tables.add(tbl);
        }

        List<ErdRelationshipResponse> relationships = new ArrayList<>();
        for (Iterator<String> it = relationshipEntities.fieldNames(); it.hasNext(); ) {
            String relId = it.next();
            JsonNode relNode = relationshipEntities.get(relId);

            ErdRelationshipResponse rel = new ErdRelationshipResponse();
            rel.setId(UUID.fromString(relId));
            rel.setSourceTableId(UUID.fromString(relNode.path("start").path("tableId").asText()));
            rel.setTargetTableId(UUID.fromString(relNode.path("end").path("tableId").asText()));
            rel.setRelationshipType(String.valueOf(relNode.path("relationshipType").asInt()));
            rel.setLogicalName(""); // 논리 이름이 없으면 빈 문자열

            List<ErdRelationshipColumnResponse> relCols = new ArrayList<>();
            JsonNode startCols = relNode.path("start").path("columnIds");
            JsonNode endCols = relNode.path("end").path("columnIds");

            for (int i = 0; i < startCols.size(); i++) {
                ErdRelationshipColumnResponse rc = new ErdRelationshipColumnResponse();
                rc.setId(UUID.fromString(relId));
                rc.setSourceColumnId(UUID.fromString(startCols.get(i).asText()));
                rc.setTargetColumnId(UUID.fromString(endCols.get(i).asText()));
                relCols.add(rc);
            }

            rel.setRelationshipColumns(relCols);
            relationships.add(rel);
        }

        ErdSnapshotDto snapshot = new ErdSnapshotDto();
        snapshot.setTables(tables);
        snapshot.setRelationships(relationships);
        return snapshot;
    }
}