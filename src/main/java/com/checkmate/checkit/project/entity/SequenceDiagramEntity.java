package com.checkmate.checkit.project.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Table(name = "Sequence_diagrams")
@Entity
@Getter
@NoArgsConstructor
public class SequenceDiagramEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "project_id", nullable = false)
	private Integer projectId;

	@Column(name = "plant_uml_code", columnDefinition = "TEXT")
	private String plantUmlCode;
}
