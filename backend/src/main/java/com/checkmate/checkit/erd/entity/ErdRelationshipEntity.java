package com.checkmate.checkit.erd.entity;

import com.checkmate.checkit.project.entity.ProjectEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "erd_relationships")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ErdRelationshipEntity {

    @Id
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private ProjectEntity project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_table_id")
    private ErdTableEntity sourceTable;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_table_id")
    private ErdTableEntity targetTable;

    @Column(name = "relationship_type")
    private String relationshipType; // 예: "1:N"

    @Column(name = "logical_name")
    private String logicalName;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
