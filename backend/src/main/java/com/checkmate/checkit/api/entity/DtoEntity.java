package com.checkmate.checkit.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "dtos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DtoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "api_spec_id", nullable = false)
    private ApiSpecEntity apiSpec;

    @Column(name = "dto_name", nullable = false)
    private String dtoName;

    @Enumerated(EnumType.STRING)
    @Column(name = "dto_type", nullable = false)
    private DtoType dtoType;

    public enum DtoType{
        REQUEST, RESPONSE
    }
}