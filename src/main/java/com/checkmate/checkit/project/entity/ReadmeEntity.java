package com.checkmate.checkit.project.entity;

import com.checkmate.checkit.global.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Table(name = "Readmes")
@Entity
@Getter
@NoArgsConstructor
public class ReadmeEntity extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "project_id", nullable = false)
	private Integer projectId;

	@Column(name = "content", nullable = false, columnDefinition = "TEXT")
	private String readmeContent;
}
