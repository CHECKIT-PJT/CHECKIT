package com.checkmate.checkit.projectbuilder.mapper;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import com.checkmate.checkit.projectbuilder.dto.InitializerRequest;
import com.checkmate.checkit.springsettings.dto.SpringSettingsDtoResponse;
import com.checkmate.checkit.springsettings.entity.SpringSettingsEntity.SpringProjectType;

/**
 * SpringSettingsDtoResponse → InitializerRequest로 변환해주는 매퍼 클래스
 * start.spring.io로 요청할 수 있는 URL 파라미터 세트를 구성하기 위함
 */
public class InitializerRequestMapper {

	/**
	 * SpringSettings DTO를 기반으로 InitializerRequest 생성
	 */
	public static InitializerRequest from(SpringSettingsDtoResponse dto) {
		return new InitializerRequest(
			convertProjectType(dto.getSpringProject()),
			dto.getSpringLanguage().name().toLowerCase(),
			convertBootVersion(dto.getSpringVersion()),
			dto.getSpringPackaging().name().toLowerCase(),
			String.valueOf(dto.getSpringJavaVersion()),
			dto.getSpringGroup(),
			dto.getSpringArtifact(),
			dto.getSpringName(),
			dto.getSpringDescription(),
			dto.getSpringPackageName(),
			convertDependencies(dto.getDependencies())
		);
	}

	/**
	 * SpringProjectType Enum을 start.spring.io의 type 파라미터 값으로 변환
	 */
	private static String convertProjectType(SpringProjectType type) {
		return switch (type) {
			case GRADLE_GROOVY, GRADLE_KOTLIN -> "gradle-project";
			case MAVEN -> "maven-project";
		};
	}

	/**
	 * 사용자 정의 version 코드(int)를 실제 부트 버전 문자열로 변환
	 */
	private static String convertBootVersion(int versionCode) {
		return switch (versionCode) {
			case 400 -> "4.0.0";
			case 350 -> "3.5.0";
			case 346 -> "3.4.6";
			case 345 -> "3.4.5";
			case 3312 -> "3.3.12";
			case 3311 -> "3.3.11";
			case 306 -> "3.0.6";
			case 305 -> "3.0.5";
			case 2710 -> "2.7.10";
			case 279 -> "2.7.9";
			case 2614 -> "2.6.14";
			default -> "3.0.6"; // fallback
		};
	}

	/**
	 * 의존성 이름 리스트를 start.spring.io에서 요구하는 ID 문자열로 연결
	 * 예: ["Spring Web", "Spring Security"] → "web,security"
	 */
	private static String convertDependencies(List<String> names) {
		return names.stream()
			.map(DependencyNameIdMap::getId)
			.filter(Objects::nonNull)
			.collect(Collectors.joining(","));
	}
}
