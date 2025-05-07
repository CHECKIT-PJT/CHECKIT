package com.checkmate.checkit.project.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Table(name = "Docker_composes")
@Entity
@Getter
@NoArgsConstructor
public class DockerComposeEntity {

	@Id
	@GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
	private Integer id;

	@Column(nullable = false)
	private Integer projectId;

	@Column(columnDefinition = "TEXT", nullable = false)
	private String content;

	@Builder
	public DockerComposeEntity(Integer projectId, String content) {
		this.projectId = projectId;
		this.content = content;
	}
}
