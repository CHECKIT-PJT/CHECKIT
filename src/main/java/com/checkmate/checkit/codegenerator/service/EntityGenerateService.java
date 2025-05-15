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

	private final Set<String> importSet = new HashSet<>();
	private final List<String> importLines = new ArrayList<>();

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
		importSet.clear();
		importLines.clear();
		StringBuilder sb = new StringBuilder();

		sb.append("package ").append(fullPackage).append(";\n\n");

		addImport("import jakarta.persistence.*;");
		addImport("import lombok.*;");

		for (MinimalColumn column : table.columns()) {
			toJavaType(column.type());
		}

		for (String imp : importLines) {
			sb.append(imp).append("\n");
		}
		sb.append("\n");

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

	private String toJavaType(String dataType) {
		if (dataType == null)
			return "String";

		String upper = dataType.toUpperCase();
		String javaType = "String";

		switch (upper) {
			case "BIGINT":
			case "BIGINT(LONG)":
				javaType = "Long";
				break;
			case "INT":
			case "INTEGER":
			case "INT(INTEGER)":
				javaType = "Integer";
				break;
			case "SMALLINT":
			case "SMALLINT(SHORT)":
				javaType = "Short";
				break;
			case "TINYINT":
			case "TINYINT(BYTE)":
				javaType = "Byte";
				break;
			case "FLOAT":
			case "FLOAT(FLOAT)":
				javaType = "Float";
				break;
			case "DOUBLE":
			case "DOUBLE(DOUBLE)":
				javaType = "Double";
				break;
			case "CHAR":
			case "CHAR(CHARACTER)":
				javaType = "Character";
				break;
			case "VARCHAR":
			case "TEXT":
			case "LONGTEXT":
			case "MEDIUMTEXT":
			case "STRING":
				javaType = "String";
				break;
			case "BOOLEAN":
			case "BOOL":
				javaType = "Boolean";
				break;
			case "DATE":
				addImport("import java.time.LocalDate;");
				javaType = "LocalDate";
				break;
			case "DATETIME":
			case "TIMESTAMP":
				addImport("import java.time.LocalDateTime;");
				javaType = "LocalDateTime";
				break;
			case "TIME":
				addImport("import java.time.LocalTime;");
				javaType = "LocalTime";
				break;
			case "UUID":
			case "UNIQUEIDENTIFIER":
				addImport("import java.util.UUID;");
				javaType = "UUID";
				break;
			case "DECIMAL":
			case "NUMERIC":
				addImport("import java.math.BigDecimal;");
				javaType = "BigDecimal";
				break;
			case "BLOB":
			case "LONGBLOB":
				javaType = "byte[]";
				break;
			default:
				javaType = "String";
		}
		return javaType;
	}

	private void addImport(String statement) {
		if (importSet.add(statement)) {
			importLines.add(statement);
		}
	}
}
