package com.checkmate.checkit.codegenerator.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.checkmate.checkit.codegenerator.dto.MinimalColumn;
import com.checkmate.checkit.codegenerator.dto.MinimalTable;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class RepositoryGenerateService {

	// import 문 중복 방지를 위한 Set
	private final StringBuilder imports = new StringBuilder();
	private final Set<String> importSet = new HashSet<>();

	/**
	 * ERD JSON을 기반으로 전체 Repository 코드 생성
	 * @param erdJson 프론트에서 저장한 ERD JSON 문자열
	 * @param basePackage 기본 패키지명
	 * @return 생성된 전체 Repository 코드 문자열
	 */
	public String generateRepositoriesFromErdJson(String erdJson, String basePackage) throws IOException {
		ObjectMapper mapper = new ObjectMapper();
		JsonNode root = mapper.readTree(erdJson);

		JsonNode tableEntities = root.path("collections").path("tableEntities");
		JsonNode columnEntities = root.path("collections").path("tableColumnEntities");

		StringBuilder result = new StringBuilder();

		// 모든 테이블 엔티티 순회
		for (Iterator<String> it = tableEntities.fieldNames(); it.hasNext(); ) {
			String tableId = it.next();
			JsonNode tableNode = tableEntities.get(tableId);
			String tableName = tableNode.path("name").asText();

			List<MinimalColumn> columns = new ArrayList<>();
			for (JsonNode colId : tableNode.path("columnIds")) {
				JsonNode colNode = columnEntities.get(colId.asText());
				String colName = colNode.path("name").asText();
				String colType = colNode.path("dataType").asText();
				boolean isPk = colNode.path("options").asInt() == 10 || colNode.path("ui").path("keys").asInt() == 1;
				boolean isNullable = !colNode.path("options").toString().contains("notNull");
				String defaultValue = colNode.path("default").asText();
				columns.add(new MinimalColumn(colName, colType, isPk, isNullable, defaultValue));
			}

			MinimalTable table = new MinimalTable(tableName, columns);
			result.append(generateRepositoryCode(table, basePackage)).append("\n");
		}

		return result.toString();
	}

	/**
	 * 단일 테이블 정보를 바탕으로 Repository 코드 생성
	 */
	public String generateRepositoryCode(MinimalTable table, String basePackage) {
		imports.setLength(0);
		importSet.clear();

		StringBuilder sb = new StringBuilder();
		String className = table.name();
		String packageName = basePackage + ".repository";

		// PK 타입 추론
		String pkType = table.columns().stream()
			.filter(MinimalColumn::isPrimaryKey)
			.findFirst()
			.map(col -> toJavaType(col.type()))
			.orElse("Long");

		// package 선언 및 import
		sb.append("package ").append(packageName).append(";\n\n");
		sb.append("import ").append(basePackage).append(".entity.").append(className).append(";\n");
		sb.append("import org.springframework.data.jpa.repository.JpaRepository;\n");
		sb.append("import org.springframework.stereotype.Repository;\n");
		sb.append(imports).append("\n");

		// 클래스 선언
		sb.append("@Repository\n");
		sb.append("public interface ").append(className).append("Repository ")
			.append("extends JpaRepository<").append(className).append(", ").append(pkType).append("> {\n\n");
		sb.append("    // TODO: Custom query methods can be defined here\n");
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
