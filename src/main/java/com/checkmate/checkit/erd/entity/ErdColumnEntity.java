package com.checkmate.checkit.erd.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "erd_columns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ErdColumnEntity {

    @Id
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id", nullable = false)
    private ErdTableEntity table;

    @Column(name = "col_logic_name")
    private String colLogicName;

    @Column(name = "col_physic_name")
    private String colPhysicName;

    private String dataType;

    @Column(name = "is_primary_key")
    private boolean isPrimaryKey;

    @Column(name = "is_nullable")
    private boolean isNullable;

    private String defaultValue;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
