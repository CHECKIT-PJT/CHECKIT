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

@Entity
@Table(name = "Projects")
@Getter
@NoArgsConstructor
public class ProjectEntity extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	@Column(name = "project_name", nullable = false, length = 100)
	private String projectName;

	public ProjectEntity(String projectName) {
		this.projectName = projectName;
	}
}
