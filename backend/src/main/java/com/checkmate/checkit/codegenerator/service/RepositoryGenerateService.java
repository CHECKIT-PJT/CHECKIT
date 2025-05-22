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
public class RepositoryGenerateService {

	private final Set<String> importSet = new HashSet<>();
	private final List<String> importLines = new ArrayList<>();

	public Map<String, String> generateRepositoriesFromErdJson(String erdJson, String basePackage) throws IOException {
		Map<String, String> result = new HashMap<>();
		ObjectMapper mapper = new ObjectMapper();
		JsonNode root = mapper.readTree(erdJson);
		JsonNode tableEntities = root.path("collections").path("tableEntities");
		JsonNode columnEntities = root.path("collections").path("tableColumnEntities");

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
			String filePath = domain + "/repository/" + className + "Repository.java";
			String fullPackage = basePackage + "." + domain;

			String repositoryCode = generateRepositoryCode(table, fullPackage, className);
			result.put(filePath, repositoryCode);
		}

		return result;
	}

	private String generateRepositoryCode(MinimalTable table, String fullPackage, String className) {
		importSet.clear();
		importLines.clear();

		StringBuilder sb = new StringBuilder();
		String packageName = fullPackage + ".repository";
		String entityPackage = fullPackage + ".entity." + className;

		// PK 타입 추론
		String pkType = table.columns().stream()
			.filter(MinimalColumn::isPrimaryKey)
			.findFirst()
			.map(col -> toJavaType(col.type()))
			.orElse("Long");

		addImport("import " + entityPackage + ";");
		addImport("import org.springframework.data.jpa.repository.JpaRepository;");
		addImport("import org.springframework.stereotype.Repository;");

		sb.append("package ").append(packageName).append(";\n\n");
		for (String imp : importLines) {
			sb.append(imp).append("\n");
		}
		sb.append("\n");

		sb.append("@Repository\n");
		sb.append("public interface ").append(className).append("Repository ")
			.append("extends JpaRepository<").append(className).append(", ").append(pkType).append("> { \n");
		sb.append("    // TODO: Custom query methods can be defined here\n");
		sb.append("}\n");

		return sb.toString();
	}

	private String toJavaType(String dataType) {
		if (dataType == null)
			return "String";
		String type = dataType.trim().toUpperCase();
		String javaType;

		switch (type) {
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
			case "DECIMAL":
			case "NUMERIC":
			case "BIGDECIMAL":
				addImport("import java.math.BigDecimal;");
				javaType = "BigDecimal";
				break;
			case "BIGINTEGER":
				addImport("import java.math.BigInteger;");
				javaType = "BigInteger";
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
			case "ZONEDDATETIME":
				addImport("import java.time.ZonedDateTime;");
				javaType = "ZonedDateTime";
				break;
			case "UUID":
			case "UNIQUEIDENTIFIER":
				addImport("import java.util.UUID;");
				javaType = "UUID";
				break;
			case "ENUM":
				javaType = "Enum";
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
