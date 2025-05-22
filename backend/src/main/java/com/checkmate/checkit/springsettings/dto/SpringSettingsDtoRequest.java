package com.checkmate.checkit.springsettings.dto;

import com.checkmate.checkit.project.entity.ProjectEntity;
import com.checkmate.checkit.springsettings.entity.SpringSettingsEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SpringSettingsDtoRequest {

	private SpringSettingsEntity.SpringProjectType springProject;
	private SpringSettingsEntity.SpringLanguageType springLanguage;
	private int springVersion;
	private String springGroup;
	private String springArtifact;
	private String springName;
	private String springDescription;
	private String springPackageName;
	private SpringSettingsEntity.SpringPackagingType springPackaging;
	private int springJavaVersion;

	// DTO → Entity 변환 메서드
	public SpringSettingsEntity toEntity(ProjectEntity projectEntity) {
		return SpringSettingsEntity.builder()
			.projectEntity(projectEntity)
			.springProject(springProject)
			.springLanguage(springLanguage)
			.springVersion(springVersion)
			.springGroup(springGroup)
			.springArtifact(springArtifact)
			.springName(springName)
			.springDescription(springDescription)
			.springPackageName(springPackageName)
			.springPackaging(springPackaging)
			.springJavaVersion(springJavaVersion)
			.build();
	}
}
