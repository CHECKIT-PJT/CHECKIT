package com.checkmate.checkit.springsettings.entity;

import com.checkmate.checkit.project.entity.ProjectEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "Dependencies")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DependencyEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	@ManyToOne
	@JoinColumn(name = "project_id", nullable = false)
	private ProjectEntity projectEntity;

	@Column(name = "dependency_name", length = 100, nullable = false)
	private String dependencyName;

}
