package com.checkmate.checkit.api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dto_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DtoItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dto_id", nullable = false)
    private DtoEntity dto;

    @Column(name = "dto_item_name", length = 100, nullable = false)
    private String dtoItemName;

    @Column(name = "data_type", nullable = false)
    private String dataType;

    @Column(name = "is_list", nullable = false)
    private Boolean isList;
}