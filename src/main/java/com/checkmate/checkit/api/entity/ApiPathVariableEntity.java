package com.checkmate.checkit.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Api_path_variables")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiPathVariableEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "api_spec_id", nullable = false)
	private ApiSpecEntity apiSpec;

	@Column(name = "path_variable", length = 255)
	private String pathVariable;

	@Column(name = "path_variable_data_type", length = 255)
	private String pathVariableDataType;
}
