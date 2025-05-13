package com.checkmate.checkit.projectbuilder.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * start.spring.io에 요청하기 위한 DTO 객체
 * SpringSettings에서 매핑된 정보를 담고 있음
 */
@Getter
@AllArgsConstructor
public class InitializerRequest {

	private String springType;              // gradle-project, maven-project
	private String springLanguage;          // java, kotlin, groovy
	private String springPlatformVersion;   // ex: 3.0.6
	private String springPackaging;         // jar, war
	private String springJvmVersion;        // ex: 17

	private String springGroupId;
	private String springArtifactId;
	private String springName;
	private String springDescription;
	private String springPackageName;

	private String springDependencyName;    // ex: web,data-jpa,security
}
