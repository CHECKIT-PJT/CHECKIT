package com.checkmate.checkit.sequencediagram;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Table(name = "Sequence_diagrams")
@Entity
@Getter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class SequenceDiagramEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "project_id", nullable = false)
	private Integer projectId;

	@Column(name = "plant_uml_code", columnDefinition = "TEXT")
	private String plantUmlCode;


	@Column(name = "image_url", columnDefinition = "TEXT")
	private String imageUrl;

	public void updatePlantUmlCode(String plantUmlCode, String imageUrl) {
		this.plantUmlCode = plantUmlCode;
		this.imageUrl = imageUrl;
	}

	public void deletePlantUmlCode() {
		this.plantUmlCode = null;
		this.imageUrl = null;
	}
}
