package com.checkmate.checkit.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Api_query_strings")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiQueryStringEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "api_spec_id", nullable = false)
    private ApiSpecEntity apiSpec;

    @Column(name = "query_string_variable", length = 255)
    private String queryStringVariable;

    @Column(name = "query_string_data_type", length = 255)
    private String queryStringDataType;
}
