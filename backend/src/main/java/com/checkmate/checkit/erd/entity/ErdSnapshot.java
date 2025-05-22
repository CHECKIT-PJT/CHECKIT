package com.checkmate.checkit.erd.entity;

import com.checkmate.checkit.project.entity.ProjectEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "erd_snapshots")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErdSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false, unique = true)
    private ProjectEntity project;

    @Lob
    @Column(name = "erd_json", columnDefinition = "TEXT", nullable = false)
    private String erdJson;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void updateErdJson(String erdJson){
        this.erdJson = erdJson;
    }
}