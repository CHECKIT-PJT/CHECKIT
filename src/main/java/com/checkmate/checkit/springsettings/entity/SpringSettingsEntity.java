package com.checkmate.checkit.springsettings.entity;

import com.checkmate.checkit.project.entity.ProjectEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Spring_settings")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpringSettingsEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	@OneToOne
	@JoinColumn(name = "project_id", nullable = false)
	private ProjectEntity projectEntity;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private SpringProjectType springProject;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private SpringLanguageType springLanguage;

	@Column(nullable = false)
	private int springVersion;

	@Column(nullable = false)
	private String springGroup;

	@Column(nullable = false)
	private String springArtifact;

	@Column(nullable = false)
	private String springName;

	@Column(nullable = false)
	private String springDescription;

	@Column(nullable = false)
	private String springPackageName;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private SpringPackagingType springPackaging;

	@Column(nullable = false)
	private int springJavaVersion;

	public enum SpringProjectType {
		GRADLE_GROOVY, GRADLE_KOTLIN, MAVEN
	}

	public enum SpringLanguageType {
		JAVA, KOTLIN, GROOVY
	}

	public enum SpringPackagingType {
		JAR, WAR
	}
}
