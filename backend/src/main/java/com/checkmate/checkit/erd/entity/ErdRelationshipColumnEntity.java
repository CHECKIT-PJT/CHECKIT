package com.checkmate.checkit.erd.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "erd_relationship_columns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ErdRelationshipColumnEntity {

    @Id
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "relationship_id", nullable = false)
    private ErdRelationshipEntity relationship;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_column_id")
    private ErdColumnEntity sourceColumn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_column_id")
    private ErdColumnEntity targetColumn;
}
