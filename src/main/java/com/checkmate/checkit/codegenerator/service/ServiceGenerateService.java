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
import lombok.RequiredArgsConstructor;

/**
 * API 명세서를 기반으로 Java Service 클래스 코드를 자동 생성하는 서비스 클래스입니다.
 * - 카테고리별로 분할된 Service 클래스를 생성합니다.
 * - 각 API 명세는 메서드 단위로 생성됩니다.
 * - 반환 타입, 파라미터 (PathVariable, QueryString, Request DTO)를 자동으로 구성합니다.
 */
@Service
@RequiredArgsConstructor
public class ServiceGenerateService {

	// Repository 주입
	private final ApiSpecRepository apiSpecRepository;
	private final ApiQueryStringRepository apiQueryStringRepository;
	private final ApiPathVariableRepository apiPathVariableRepository;
	private final DtoRepository dtoRepository;
	private final DtoItemRepository dtoItemRepository;

	// import 중복 방지용 구조
	private final Set<String> importSet = new HashSet<>();
	private final StringBuilder imports = new StringBuilder();

	/**
	 * 프로젝트 내 API 명세들을 카테고리별로 분리하여 Service 클래스를 생성합니다.
	 */
	public Map<String, String> generateServiceCodeByCategory(int projectId, String basePackage) {
		List<ApiSpecEntity> apiSpecs = apiSpecRepository.findAllByProjectId_Id(projectId);
		if (apiSpecs.isEmpty()) {
			throw new RuntimeException("API 명세가 존재하지 않습니다.");
		}
		return buildServiceClassCodeByCategory(apiSpecs, basePackage);
	}

	/**
	 * 카테고리 기준으로 API들을 묶어 각 Service 클래스 코드 생성
	 */
	private Map<String, String> buildServiceClassCodeByCategory(List<ApiSpecEntity> apiSpecs, String basePackage) {
		Map<String, List<ApiSpecEntity>> categoryGrouped = apiSpecs.stream()
			.collect(Collectors.groupingBy(ApiSpecEntity::getCategory));

		Map<String, String> serviceClassCodes = new HashMap<>();
		for (Map.Entry<String, List<ApiSpecEntity>> entry : categoryGrouped.entrySet()) {
			String category = entry.getKey();
			List<ApiSpecEntity> specs = entry.getValue();
			String classCode = generateServiceClassCode(category, specs, basePackage);
			serviceClassCodes.put(category, classCode);
		}
		return serviceClassCodes;
	}

	/**
	 * 하나의 카테고리에 대한 Service 클래스 전체 코드 생성
	 */
	private String generateServiceClassCode(String category, List<ApiSpecEntity> specs, String basePackage) {
		importSet.clear();
		imports.setLength(0);

		StringBuilder sb = new StringBuilder();
		String className = capitalize(category) + "Service";

		// 1. package 선언
		sb.append("package ").append(basePackage).append(".").append(category).append(".service;\n\n");

		// 2. 기본 import
		addImport("import lombok.RequiredArgsConstructor;");
		addImport("import org.springframework.stereotype.Service;");
		addImport("import org.springframework.transaction.annotation.Transactional;");

		// 3. 필요한 import 자동 추가 (Response DTO의 필드 타입 분석)
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

		// 4. import 구문 삽입
		sb.append(imports).append("\n");

		// 5. 클래스 선언부
		sb.append("@Service\n@RequiredArgsConstructor\n@Transactional\n");
		sb.append("public class ").append(className).append(" {\n\n");

		// 6. 각 API 명세별 메서드 생성
		for (ApiSpecEntity spec : specs) {
			sb.append(generateMethodFromSpec(spec)).append("\n");
		}

		sb.append("}\n");
		return sb.toString();
	}

	/**
	 * 하나의 API 명세서 → 하나의 Java 메서드 코드로 변환
	 * - 반환 타입: RESPONSE DTO 또는 void
	 * - 파라미터: PathVariable, QueryString, Request DTO 순서로 구성
	 */
	private String generateMethodFromSpec(ApiSpecEntity spec) {
		StringBuilder sb = new StringBuilder();
		String methodName = spec.getApiName();

		// 1. 반환 타입 결정
		String returnType = "void";
		List<DtoEntity> dtos = dtoRepository.findByApiSpecId(spec.getId());
		for (DtoEntity dto : dtos) {
			if (dto.getDtoType() == DtoEntity.DtoType.RESPONSE) {
				returnType = dto.getDtoName();  // ex: UserResponse
				break;
			}
		}

		// 2. 파라미터 수집
		List<String> paramList = new ArrayList<>();

		// PathVariable
		List<ApiPathVariableEntity> pathVars = apiPathVariableRepository.findByApiSpec(spec);
		for (ApiPathVariableEntity var : pathVars) {
			String name = var.getPathVariable();
			String type = toJavaType(var.getPathVariableDataType());
			paramList.add(type + " " + name);
		}

		// QueryString
		List<ApiQueryStringEntity> queryStrings = apiQueryStringRepository.findByApiSpec(spec);
		for (ApiQueryStringEntity q : queryStrings) {
			String name = q.getQueryStringVariable();
			String type = toJavaType(q.getQueryStringDataType());
			paramList.add(type + " " + name);
		}

		// Request DTO
		for (DtoEntity dto : dtos) {
			if (dto.getDtoType() == DtoEntity.DtoType.REQUEST) {
				paramList.add(dto.getDtoName() + " request");
				break;
			}
		}

		// 3. 메서드 시그니처
		sb.append("    public ").append(returnType).append(" ").append(methodName).append("(");
		sb.append(String.join(", ", paramList));
		sb.append(") {\n");

		// 4. 본문 템플릿
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
