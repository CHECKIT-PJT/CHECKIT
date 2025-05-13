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
	private StringBuilder imports = new StringBuilder();

	/**
	 * 프로젝트 내 API 명세 기반으로 Request/Response DTO 생성
	 */
	public Map<String, String> generateDtos(int projectId, String basePackage) {
		Map<String, String> dtoFiles = new HashMap<>();

		List<ApiSpecEntity> apiSpecs = apiSpecRepository.findAllByProjectId_Id(projectId);

		for (ApiSpecEntity apiSpec : apiSpecs) {
			Long apiSpecId = apiSpec.getId();
			String domain = apiSpec.getCategory().toLowerCase();

			List<DtoEntity> dtoList = dtoRepository.findByApiSpecId(apiSpecId);

			for (DtoEntity dto : dtoList) {
				String className = StringUtils.toPascalCase(dto.getDtoName()); // PascalCase 적용
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

				String dtoCode = generateDtoClass(className, dtoItems);
				String filePath = domain + "/dto/" + className + ".java"; // PascalCase 적용
				dtoFiles.put(filePath, dtoCode);
			}
		}

		return dtoFiles;
	}

	/**
	 * 쿼리스트링만 따로 사용하는 DTO 생성기
	 * - 이름: {ApiName}QueryDto
	 */
	public Map<String, String> generateQueryDtos(int projectId) {
		Map<String, String> dtoFiles = new HashMap<>();

		List<ApiSpecEntity> apiSpecs = apiSpecRepository.findAllByProjectId_Id(projectId);

		for (ApiSpecEntity apiSpec : apiSpecs) {
			List<ApiQueryStringEntity> queryStrings = apiQueryStringRepository.findByApiSpec(apiSpec);
			if (queryStrings.isEmpty())
				continue;

			String domain = apiSpec.getCategory().toLowerCase();
			String className = StringUtils.toPascalCase(apiSpec.getApiName() + "QueryDto"); // PascalCase 적용

			List<SimpleField> fields = queryStrings.stream()
				.map(q -> new SimpleField(q.getQueryStringVariable(), q.getQueryStringDataType()))
				.toList();

			String dtoCode = generateSimpleDtoClass(className, fields);
			String filePath = domain + "/dto/" + className + ".java"; // PascalCase 적용
			dtoFiles.put(filePath, dtoCode);
		}

		return dtoFiles;
	}

	private String generateDtoClass(String className, List<DtoItemEntity> fields) {
		importSet.clear();
		imports.setLength(0);

		StringBuilder sb = new StringBuilder();
		addImport("import lombok.*;");
		sb.append(imports).append("\n");

		sb.append("@Getter\n@Setter\n@NoArgsConstructor\n@AllArgsConstructor\n@Builder\n");
		sb.append("public class ").append(className).append(" {\n\n");

		for (DtoItemEntity field : fields) {
			String type = toJavaType(field.getDataType());
			if (Boolean.TRUE.equals(field.getIsList())) {
				addImport("import java.util.List;");
				type = "List<" + type + ">";
			}
			sb.append("    private ").append(type).append(" ").append(field.getDtoItemName()).append(";\n");
		}

		sb.append("}\n");
		return sb.toString();
	}

	private String generateSimpleDtoClass(String className, List<SimpleField> fields) {
		importSet.clear();
		imports.setLength(0);

		StringBuilder sb = new StringBuilder();
		addImport("import lombok.*;");
		sb.append(imports).append("\n");

		sb.append("@Getter\n@Setter\n@NoArgsConstructor\n@AllArgsConstructor\n@Builder\n");
		sb.append("public class ").append(className).append(" {\n\n");

		for (SimpleField field : fields) {
			String type = toJavaType(field.getDataType());
			sb.append("    private ").append(type).append(" ").append(field.getFieldName()).append(";\n");
		}

		sb.append("}\n");
		return sb.toString();
	}

	/**
	 * DB 데이터 타입 → Java 타입 변환 및 필요시 import 추가
	 */
	private String toJavaType(String dataType) {
		if (dataType == null)
			return "String";

		String type = dataType.trim();

		switch (type) {
			case "Integer", "Long", "Short", "Byte", "Float", "Double",
				"Character", "Boolean", "String":
				return type;

			case "LocalDate":
				addImport("import java.time.LocalDate;");
				return "LocalDate";

			case "LocalDateTime":
				addImport("import java.time.LocalDateTime;");
				return "LocalDateTime";

			case "ZonedDateTime":
				addImport("import java.time.ZonedDateTime;");
				return "ZonedDateTime";

			case "BigDecimal":
				addImport("import java.math.BigDecimal;");
				return "BigDecimal";

			case "BigInteger":
				addImport("import java.math.BigInteger;");
				return "BigInteger";

			case "UUID":
				addImport("import java.util.UUID;");
				return "UUID";

			case "enum":
				return "Enum"; // 추후 enum 생성기로 확장 가능

			default:
				return "String";
		}
	}

	/**
	 * 중복 import 방지 + 누적 저장
	 */
	private void addImport(String statement) {
		if (importSet.add(statement)) {
			imports.append(statement).append("\n");
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
