package com.checkmate.checkit.springsettings.dto;

import java.util.List;

import com.checkmate.checkit.springsettings.entity.SpringSettingsEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SpringSettingsDtoResponse {

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
	private List<String> dependencies;

	public static SpringSettingsDtoResponse fromEntity(SpringSettingsEntity entity, List<String> dependencies) {
		return new SpringSettingsDtoResponse(
			entity.getSpringProject(),
			entity.getSpringLanguage(),
			entity.getSpringVersion(),
			entity.getSpringGroup(),
			entity.getSpringArtifact(),
			entity.getSpringName(),
			entity.getSpringDescription(),
			entity.getSpringPackageName(),
			entity.getSpringPackaging(),
			entity.getSpringJavaVersion(),
			dependencies
		);
	}
}
