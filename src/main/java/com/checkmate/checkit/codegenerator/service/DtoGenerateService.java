package com.checkmate.checkit.codegenerator.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.checkmate.checkit.api.entity.ApiQueryStringEntity;
import com.checkmate.checkit.api.entity.ApiSpecEntity;
import com.checkmate.checkit.api.entity.DtoEntity;
import com.checkmate.checkit.api.entity.DtoItemEntity;
import com.checkmate.checkit.api.repository.ApiQueryStringRepository;
import com.checkmate.checkit.api.repository.ApiSpecRepository;
import com.checkmate.checkit.api.repository.DtoItemRepository;
import com.checkmate.checkit.api.repository.DtoRepository;
import com.checkmate.checkit.codegenerator.util.StringUtils;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DtoGenerateService {

	private final ApiSpecRepository apiSpecRepository;
	private final DtoRepository dtoRepository;
	private final DtoItemRepository dtoItemRepository;
	private final ApiQueryStringRepository apiQueryStringRepository;

	private final Set<String> importSet = new HashSet<>();
	private final List<String> importLines = new ArrayList<>();

	public Map<String, String> generateDtos(int projectId, String basePackage) {
		Map<String, String> dtoFiles = new HashMap<>();
		List<ApiSpecEntity> apiSpecs = apiSpecRepository.findAllByProjectId_Id(projectId);

		for (ApiSpecEntity apiSpec : apiSpecs) {
			Long apiSpecId = apiSpec.getId();
			String domain = apiSpec.getCategory().toLowerCase();
			List<DtoEntity> dtoList = dtoRepository.findByApiSpecId(apiSpecId);

			for (DtoEntity dto : dtoList) {
				String rawName = dto.getDtoName();
				String className;
				if (dto.getDtoType() == DtoEntity.DtoType.REQUEST) {
					className = StringUtils.toPascalCase(rawName) + "Request";
				} else if (dto.getDtoType() == DtoEntity.DtoType.RESPONSE) {
					className = StringUtils.toPascalCase(rawName) + "Response";
				} else {
					className = StringUtils.toPascalCase(rawName);
				}

				List<DtoItemEntity> dtoItems = new ArrayList<>(dtoItemRepository.findByDto(dto));

				if (dto.getDtoType() == DtoEntity.DtoType.REQUEST) {
					List<ApiQueryStringEntity> queryStrings = apiQueryStringRepository.findByApiSpec(apiSpec);
					for (ApiQueryStringEntity query : queryStrings) {
						dtoItems.add(DtoItemEntity.builder()
							.dto(dto)
							.dtoItemName(query.getQueryStringVariable())
							.dataType(query.getQueryStringDataType())
							.isList(false)
							.build());
					}
				}

				String dtoCode = generateDtoClass(className, dtoItems, basePackage, domain);
				String filePath = domain + "/dto/" + className + ".java";
				dtoFiles.put(filePath, dtoCode);
			}
		}
		return dtoFiles;
	}

	public Map<String, String> generateQueryDtos(int projectId, String basePackage) {
		Map<String, String> dtoFiles = new HashMap<>();
		List<ApiSpecEntity> apiSpecs = apiSpecRepository.findAllByProjectId_Id(projectId);

		for (ApiSpecEntity apiSpec : apiSpecs) {
			List<ApiQueryStringEntity> queryStrings = apiQueryStringRepository.findByApiSpec(apiSpec);
			if (queryStrings.isEmpty())
				continue;

			String domain = apiSpec.getCategory().toLowerCase();
			String className = StringUtils.toPascalCase(apiSpec.getApiName()) + "QueryDto";

			List<SimpleField> fields = new ArrayList<>();
			for (ApiQueryStringEntity q : queryStrings) {
				fields.add(new SimpleField(q.getQueryStringVariable(), q.getQueryStringDataType()));
			}

			String dtoCode = generateSimpleDtoClass(className, fields, basePackage, domain);
			String filePath = domain + "/dto/" + className + ".java";
			dtoFiles.put(filePath, dtoCode);
		}
		return dtoFiles;
	}

	private String generateDtoClass(String className, List<DtoItemEntity> fields, String basePackage, String domain) {
		importSet.clear();
		importLines.clear();

		StringBuilder sb = new StringBuilder();
		String packageName = basePackage + "." + domain + ".dto";
		sb.append("package ").append(packageName).append(";\n\n");

		addImport("import lombok.*;");
		for (DtoItemEntity field : fields) {
			toJavaType(field.getDataType(), field.getIsList());
		}
		importLines.forEach(line -> sb.append(line).append("\n"));
		sb.append("\n");

		sb.append("@Getter\n@Setter\n@NoArgsConstructor\n@AllArgsConstructor\n@Builder\n");
		sb.append("public class ").append(className).append(" {\n\n");

		for (DtoItemEntity field : fields) {
			String type = toJavaType(field.getDataType(), field.getIsList());
			sb.append("    private ").append(type).append(" ").append(field.getDtoItemName()).append(";\n");
		}

		sb.append("}\n");
		return sb.toString();
	}

	private String generateSimpleDtoClass(String className, List<SimpleField> fields, String basePackage,
		String domain) {
		importSet.clear();
		importLines.clear();

		StringBuilder sb = new StringBuilder();
		String packageName = basePackage + "." + domain + ".dto";
		sb.append("package ").append(packageName).append(";\n\n");

		addImport("import lombok.*;");
		for (SimpleField field : fields) {
			toJavaType(field.getDataType(), false);
		}
		importLines.forEach(line -> sb.append(line).append("\n"));
		sb.append("\n");

		sb.append("@Getter\n@Setter\n@NoArgsConstructor\n@AllArgsConstructor\n@Builder\n");
		sb.append("public class ").append(className).append(" {\n\n");

		for (SimpleField field : fields) {
			String type = toJavaType(field.getDataType(), false);
			sb.append("    private ").append(type).append(" ").append(field.getFieldName()).append(";\n");
		}

		sb.append("}\n");
		return sb.toString();
	}

	/**
	 * DB 데이터 타입 → Java 타입 변환 및 필요시 import 추가
	 */
	private String toJavaType(String dataType, Boolean isList) {
		if (dataType == null)
			return "String";

		String type = dataType.trim();
		String javaType;

		switch (type) {
			case "Integer", "Long", "Short", "Byte", "Float", "Double",
				"Character", "Boolean", "String":
				javaType = type;
				break;
			case "LocalDate":
				addImport("import java.time.LocalDate;");
				javaType = "LocalDate";
				break;
			case "LocalDateTime":
				addImport("import java.time.LocalDateTime;");
				javaType = "LocalDateTime";
				break;
			case "ZonedDateTime":
				addImport("import java.time.ZonedDateTime;");
				javaType = "ZonedDateTime";
				break;
			case "BigDecimal":
				addImport("import java.math.BigDecimal;");
				javaType = "BigDecimal";
				break;
			case "BigInteger":
				addImport("import java.math.BigInteger;");
				javaType = "BigInteger";
				break;
			case "UUID":
				addImport("import java.util.UUID;");
				javaType = "UUID";
				break;
			case "enum":
				javaType = "Enum"; // 향후 enum 자동 생성기로 확장 가능
				break;
			default:
				javaType = "String";
		}

		if (Boolean.TRUE.equals(isList)) {
			addImport("import java.util.List;");
			return "List<" + javaType + ">";
		}

		return javaType;
	}

	/**
	 * 중복 import 방지 + 누적 저장
	 */
	private void addImport(String statement) {
		if (importSet.add(statement)) {
			importLines.add(statement);
		}
	}

	/**
	 * 쿼리 DTO용 간단한 필드 표현 클래스 (불변 구조)
	 */
	private static class SimpleField {
		private final String fieldName;
		private final String dataType;

		public SimpleField(String fieldName, String dataType) {
			this.fieldName = fieldName;
			this.dataType = dataType;
		}

		public String getFieldName() {
			return fieldName;
		}

		public String getDataType() {
			return dataType;
		}
	}
}
