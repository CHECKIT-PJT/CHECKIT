package com.checkmate.checkit.springsettings.dto;

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

	private int id;
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
}
