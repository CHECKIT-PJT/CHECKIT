package com.checkmate.checkit.codegenerator.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.checkmate.checkit.api.entity.ApiPathVariableEntity;
import com.checkmate.checkit.api.entity.ApiQueryStringEntity;
import com.checkmate.checkit.api.entity.ApiSpecEntity;
import com.checkmate.checkit.api.entity.DtoEntity;
import com.checkmate.checkit.api.entity.DtoItemEntity;
import com.checkmate.checkit.api.repository.ApiPathVariableRepository;
import com.checkmate.checkit.api.repository.ApiQueryStringRepository;
import com.checkmate.checkit.api.repository.ApiSpecRepository;
import com.checkmate.checkit.api.repository.DtoItemRepository;
import com.checkmate.checkit.api.repository.DtoRepository;
import com.checkmate.checkit.codegenerator.util.StringUtils;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ServiceGenerateService {

	private final ApiSpecRepository apiSpecRepository;
	private final ApiQueryStringRepository apiQueryStringRepository;
	private final ApiPathVariableRepository apiPathVariableRepository;
	private final DtoRepository dtoRepository;
	private final DtoItemRepository dtoItemRepository;

	private final Set<String> importSet = new HashSet<>();
	private final StringBuilder imports = new StringBuilder();

	public Map<String, String> generateServiceCodeByCategory(int projectId, String basePackage) {
		List<ApiSpecEntity> apiSpecs = apiSpecRepository.findAllByProjectId_Id(projectId);
		if (apiSpecs.isEmpty()) {
			throw new RuntimeException("API 명세가 존재하지 않습니다.");
		}
		return buildServiceClassCodeByCategory(apiSpecs, basePackage);
	}

	private Map<String, String> buildServiceClassCodeByCategory(List<ApiSpecEntity> apiSpecs, String basePackage) {
		Map<String, List<ApiSpecEntity>> categoryGrouped = apiSpecs.stream()
			.collect(Collectors.groupingBy(ApiSpecEntity::getCategory));

		Map<String, String> serviceClassCodes = new HashMap<>();
		for (Map.Entry<String, List<ApiSpecEntity>> entry : categoryGrouped.entrySet()) {
			String category = entry.getKey();
			List<ApiSpecEntity> specs = entry.getValue();
			String className = StringUtils.toPascalCase(category) + "Service"; // 변경
			String classCode = generateServiceClassCode(className, category, specs, basePackage);
			String filePath = category.toLowerCase() + "/service/" + className + ".java";
			serviceClassCodes.put(filePath, classCode);
		}
		return serviceClassCodes;
	}

	private String generateServiceClassCode(String className, String category, List<ApiSpecEntity> specs,
		String basePackage) {
		importSet.clear();
		imports.setLength(0);

		StringBuilder sb = new StringBuilder();

		sb.append("package ").append(basePackage).append(".").append(category.toLowerCase()).append(".service;\n\n");

		addImport("import lombok.RequiredArgsConstructor;");
		addImport("import org.springframework.stereotype.Service;");
		addImport("import org.springframework.transaction.annotation.Transactional;");

		for (ApiSpecEntity spec : specs) {
			List<DtoEntity> dtos = dtoRepository.findByApiSpecId(spec.getId());
			for (DtoEntity dto : dtos) {
				if (dto.getDtoType() != DtoEntity.DtoType.RESPONSE)
					continue;

				List<DtoItemEntity> items = dtoItemRepository.findByDto(dto);
				for (DtoItemEntity item : items) {
					String type = item.getDataType();
					if (Boolean.TRUE.equals(item.getIsList()))
						addImport("import java.util.List;");
					if ("LocalDateTime".equals(type))
						addImport("import java.time.LocalDateTime;");
					if ("LocalDate".equals(type))
						addImport("import java.time.LocalDate;");
					if ("ZonedDateTime".equals(type))
						addImport("import java.time.ZonedDateTime;");
				}
			}
		}

		sb.append(imports).append("\n");
		sb.append("@Service\n@RequiredArgsConstructor\n@Transactional\n");
		sb.append("public class ").append(className).append(" {\n\n");

		for (ApiSpecEntity spec : specs) {
			sb.append(generateMethodFromSpec(spec)).append("\n");
		}
		sb.append("}\n");
		return sb.toString();
	}

	private String generateMethodFromSpec(ApiSpecEntity spec) {
		StringBuilder sb = new StringBuilder();
		String methodName = StringUtils.toCamelCase(spec.getApiName()); // 변경
		String returnType = "void";

		List<DtoEntity> dtos = dtoRepository.findByApiSpecId(spec.getId());
		for (DtoEntity dto : dtos) {
			if (dto.getDtoType() == DtoEntity.DtoType.RESPONSE) {
				returnType = StringUtils.toPascalCase(dto.getDtoName()); // 변경
				break;
			}
		}

		List<String> paramList = new ArrayList<>();

		List<ApiPathVariableEntity> pathVars = apiPathVariableRepository.findByApiSpec(spec);
		for (ApiPathVariableEntity var : pathVars) {
			paramList.add(toJavaType(var.getPathVariableDataType()) + " " + var.getPathVariable());
		}

		List<ApiQueryStringEntity> queryStrings = apiQueryStringRepository.findByApiSpec(spec);
		for (ApiQueryStringEntity q : queryStrings) {
			paramList.add(toJavaType(q.getQueryStringDataType()) + " " + q.getQueryStringVariable());
		}

		for (DtoEntity dto : dtos) {
			if (dto.getDtoType() == DtoEntity.DtoType.REQUEST) {
				String dtoName = StringUtils.toPascalCase(dto.getDtoName());
				paramList.add(dtoName + " request");
				break;
			}
		}

		sb.append("    public ").append(returnType).append(" ").append(methodName).append("(")
			.append(String.join(", ", paramList)).append(") {\n");
		sb.append("        // TODO: ").append(methodName).append(" 구현\n");
		if (!"void".equals(returnType)) {
			sb.append("        return null;\n");
		}
		sb.append("    }\n");

		return sb.toString();
	}

	/**
	 * import 중복 방지 추가
	 */
	private void addImport(String statement) {
		if (importSet.add(statement)) {
			imports.append(statement).append("\n");
		}
	}

	/**
	 * 클래스 이름 등 첫 글자 대문자 처리
	 */
	private String capitalize(String name) {
		if (name == null || name.isEmpty())
			return name;
		return name.substring(0, 1).toUpperCase() + name.substring(1);
	}

	/**
	 * API 명세에 입력된 타입(String 기반)을 Java 타입으로 변환
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
}
