package com.checkmate.checkit.codegenerator.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.checkmate.checkit.codegenerator.dto.MinimalColumn;
import com.checkmate.checkit.codegenerator.dto.MinimalTable;
import com.checkmate.checkit.codegenerator.util.StringUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class EntityGenerateService {

	private final StringBuilder imports = new StringBuilder();
	private final Set<String> importSet = new HashSet<>();

	public Map<String, String> generateEntitiesFromErdJson(String erdJson, String basePackage) throws IOException {
		ObjectMapper mapper = new ObjectMapper();
		JsonNode root = mapper.readTree(erdJson);

		JsonNode tableEntities = root.path("collections").path("tableEntities");
		JsonNode columnEntities = root.path("collections").path("tableColumnEntities");

		Map<String, String> entityFiles = new HashMap<>();

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
			String domain = table.name().toLowerCase();
			String className = StringUtils.capitalize(table.name());
			String fullPackage = basePackage + "." + domain + ".entity";
			String classCode = generateEntityCode(table, fullPackage, className);
			String filePath = domain + "/entity/" + className + ".java";
			entityFiles.put(filePath, classCode);
		}

		return entityFiles;
	}

	public String generateEntityCode(MinimalTable table, String fullPackage, String className) {
		imports.setLength(0);
		importSet.clear();

		StringBuilder sb = new StringBuilder();

		sb.append("package ").append(fullPackage).append(";\n\n");

		addImport("import jakarta.persistence.*;");
		addImport("import lombok.*;");
		sb.append(imports).append("\n");

		sb.append("@Entity\n");
		sb.append("@Table(name = \"").append(table.name().toLowerCase()).append("\")\n");
		sb.append("@Getter\n@Setter\n@NoArgsConstructor\n@AllArgsConstructor\n@Builder\n");

		sb.append("public class ").append(className).append(" {\n\n");

		for (MinimalColumn col : table.columns()) {
			sb.append(generateField(col));
		}

		sb.append("}\n");
		return sb.toString();
	}

	private String generateField(MinimalColumn column) {
		StringBuilder sb = new StringBuilder();
		if (column.isPrimaryKey()) {
			sb.append("    @Id\n");
			sb.append("    @GeneratedValue(strategy = GenerationType.IDENTITY)\n");
		}
		sb.append("    @Column(name = \"").append(column.name()).append("\"");
		if (!column.isNullable()) {
			sb.append(", nullable = false");
		}
		if (column.defaultValue() != null && !column.defaultValue().isBlank()) {
			String defaultVal = column.defaultValue().trim();
			if (column.type().toUpperCase().contains("CHAR") || column.type().toUpperCase().contains("TEXT")
				|| column.type().toUpperCase().contains("VARCHAR")) {
				defaultVal = "'" + defaultVal + "'";
			}
			sb.append(", columnDefinition = \"")
				.append(column.type())
				.append(" DEFAULT ")
				.append(defaultVal)
				.append("\"");
		}
		sb.append(")\n");
		sb.append("    private ")
			.append(toJavaType(column.type()))
			.append(" ")
			.append(toCamelCase(column.name()))
			.append(";\n\n");
		return sb.toString();
	}

	private String toCamelCase(String name) {
		String[] parts = name.split("_");
		StringBuilder sb = new StringBuilder(parts[0]);
		for (int i = 1; i < parts.length; i++) {
			sb.append(parts[i].substring(0, 1).toUpperCase()).append(parts[i].substring(1));
		}
		return sb.toString();
	}

	/**
	 * DB의 데이터 타입을 Java 타입으로 변환합니다.
	 * + 해당 타입이 필요한 경우 자동으로 import 문도 추가합니다.
	 */
	private String toJavaType(String dataType) {
		if (dataType == null)
			return "String";

		String upper = dataType.toUpperCase();

		// 숫자 타입 매핑
		if (upper.equals("BIGINT") || upper.equals("BIGINT(LONG)"))
			return "Long";
		if (upper.equals("INT") || upper.equals("INTEGER") || upper.equals("INT(INTEGER)"))
			return "Integer";
		if (upper.equals("SMALLINT") || upper.equals("SMALLINT(SHORT)"))
			return "Short";
		if (upper.equals("TINYINT") || upper.equals("TINYINT(BYTE)"))
			return "Byte";
		if (upper.equals("FLOAT") || upper.equals("FLOAT(FLOAT)"))
			return "Float";
		if (upper.equals("DOUBLE") || upper.equals("DOUBLE(DOUBLE)"))
			return "Double";

		// 문자 타입 매핑
		if (upper.equals("CHAR") || upper.equals("CHAR(CHARACTER)"))
			return "Character";
		if (upper.matches("VARCHAR|TEXT|LONGTEXT|MEDIUMTEXT|STRING"))
			return "String";

		// 불리언
		if (upper.equals("BOOLEAN") || upper.equals("BOOL"))
			return "Boolean";

		// 날짜/시간
		if (upper.equals("DATE")) {
			if (!imports.toString().contains("java.time.LocalDate")) {
				addImport("import java.time.LocalDate;");
			}
			return "LocalDate";
		}

		if (upper.equals("DATETIME") || upper.equals("TIMESTAMP")) {
			if (!imports.toString().contains("java.time.LocalDateTime")) {
				addImport("import java.time.LocalDateTime;");
			}
			return "LocalDateTime";
		}

		if (upper.equals("TIME")) {
			if (!imports.toString().contains("java.time.LocalTime")) {
				addImport("import java.time.LocalTime;");
			}
			return "LocalTime";
		}

		// 기타
		if (upper.equals("UUID") || upper.equals("UNIQUEIDENTIFIER")) {
			if (!imports.toString().contains("java.util.UUID")) {
				addImport("import java.util.UUID;");
			}
			return "UUID";
		}

		if (upper.equals("DECIMAL") || upper.equals("NUMERIC")) {
			if (!imports.toString().contains("java.math.BigDecimal")) {
				addImport("import java.math.BigDecimal;");
			}
			return "BigDecimal";
		}

		if (upper.equals("BLOB") || upper.equals("LONGBLOB"))
			return "byte[]";

		// 기본값
		return "String";
	}

	private void addImport(String imp) {
		if (importSet.add(imp))
			imports.append(imp).append("\n");
	}
}
