package com.checkmate.checkit.codegenerator.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.checkmate.checkit.erd.dto.response.ErdColumnResponse;
import com.checkmate.checkit.erd.dto.response.ErdTableResponse;

@Service
public class RepositoryGenerateService {

	// Repository 코드에서 필요한 import 구문 저장 (중복 방지)
	private final StringBuilder imports = new StringBuilder();
	private final Set<String> importSet = new HashSet<>();

	/**
	 * ERD 테이블 정보를 기반으로 Spring Data JPA Repository 코드 생성
	 *
	 * @param table       ERD 테이블 정보
	 * @param columns     해당 테이블의 컬럼 리스트
	 * @param basePackage base 패키지 이름 (예: com.checkmate.checkit)
	 * @return 완성된 Repository 코드 문자열
	 */
	public String generateRepositoryCode(ErdTableResponse table, List<ErdColumnResponse> columns, String basePackage) {
		imports.setLength(0); // import 누적 초기화
		importSet.clear();

		StringBuilder sb = new StringBuilder();

		// Entity 클래스명 (PhysicName 기준)
		String className = table.getTblPhysicName();

		// Repository 패키지 설정
		String packageName = basePackage + ".repository";

		// PK 타입 추출
		String pkType = columns.stream()
			.filter(ErdColumnResponse::isPrimaryKey)
			.findFirst()
			.map(col -> toJavaType(col.getDataType()))
			.orElse("Long"); // 기본값: Long

		// 패키지 선언
		sb.append("package ").append(packageName).append(";\n\n");

		// import 구문
		sb.append("import ").append(basePackage).append(".entity.").append(className).append(";\n");
		sb.append("import org.springframework.data.jpa.repository.JpaRepository;\n");
		sb.append("import org.springframework.stereotype.Repository;\n");
		sb.append(imports).append("\n");

		// 클래스 선언
		sb.append("@Repository\n");
		sb.append("public interface ").append(className).append("Repository ")
			.append("extends JpaRepository<").append(className).append(", ").append(pkType).append("> {\n\n");

		// TODO 영역 (커스텀 메서드 자리)
		sb.append("    // TODO: Custom query methods can be defined here\n");

		// 8. 클래스 닫기
		sb.append("}\n");

		return sb.toString();
	}

	private String toJavaType(String dataType) {
		if (dataType == null)
			return "String";

		String type = dataType.trim().toUpperCase(); // 대소문자 구분 제거

		switch (type) {
			// 숫자형 타입
			case "BIGINT", "BIGINT(LONG)":
				return "Long";

			case "INT", "INTEGER", "INT(INTEGER)":
				return "Integer";

			case "SMALLINT", "SMALLINT(SHORT)":
				return "Short";

			case "TINYINT", "TINYINT(BYTE)":
				return "Byte";

			case "FLOAT", "FLOAT(FLOAT)":
				return "Float";

			case "DOUBLE", "DOUBLE(DOUBLE)":
				return "Double";

			case "DECIMAL", "NUMERIC", "BIGDECIMAL":
				addImport("import java.math.BigDecimal;");
				return "BigDecimal";

			case "BIGINTEGER":
				addImport("import java.math.BigInteger;");
				return "BigInteger";

			// 문자형 타입
			case "CHAR", "CHAR(CHARACTER)":
				return "Character";

			case "VARCHAR", "TEXT", "LONGTEXT", "MEDIUMTEXT", "STRING":
				return "String";

			// 논리형
			case "BOOLEAN", "BOOL":
				return "Boolean";

			// 날짜/시간
			case "DATE":
				addImport("import java.time.LocalDate;");
				return "LocalDate";

			case "DATETIME", "TIMESTAMP":
				addImport("import java.time.LocalDateTime;");
				return "LocalDateTime";

			case "TIME":
				addImport("import java.time.LocalTime;");
				return "LocalTime";

			case "ZONEDDATETIME":
				addImport("import java.time.ZonedDateTime;");
				return "ZonedDateTime";

			// 식별자
			case "UUID", "UNIQUEIDENTIFIER":
				addImport("import java.util.UUID;");
				return "UUID";

			// enum 타입
			case "ENUM":
				return "Enum"; // 추후 enum 클래스 생성기에서 처리

			// 바이너리
			case "BLOB", "LONGBLOB":
				return "byte[]";

			// 기본값 (문자열)
			default:
				return "String";
		}
	}

	private void addImport(String statement) {
		if (importSet.add(statement)) {
			imports.append(statement).append("\n");
		}
	}
}
