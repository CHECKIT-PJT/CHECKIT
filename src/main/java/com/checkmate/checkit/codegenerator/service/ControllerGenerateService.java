package com.checkmate.checkit.codegenerator.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.checkmate.checkit.api.entity.ApiSpecEntity;
import com.checkmate.checkit.api.entity.DtoEntity;
import com.checkmate.checkit.api.repository.ApiPathVariableRepository;
import com.checkmate.checkit.api.repository.ApiQueryStringRepository;
import com.checkmate.checkit.api.repository.ApiSpecRepository;
import com.checkmate.checkit.api.repository.DtoItemRepository;
import com.checkmate.checkit.api.repository.DtoRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ControllerGenerateService {

	private final ApiSpecRepository apiSpecRepository;
	private final ApiQueryStringRepository apiQueryStringRepository;
	private final ApiPathVariableRepository apiPathVariableRepository;
	private final DtoRepository dtoRepository;
	private final DtoItemRepository dtoItemRepository;

	public Map<String, String> generateControllersByCategory(int projectId, String basePackage) {
		List<ApiSpecEntity> apiSpecs = apiSpecRepository.findAllByProjectId_Id(projectId);
		Map<String, List<ApiSpecEntity>> categorized = apiSpecs.stream()
			.collect(Collectors.groupingBy(ApiSpecEntity::getCategory));

		Map<String, String> controllerFiles = new HashMap<>();
		for (Map.Entry<String, List<ApiSpecEntity>> entry : categorized.entrySet()) {
			String category = entry.getKey();
			List<ApiSpecEntity> specs = entry.getValue();
			String code = generateControllerClassCode(category, specs, basePackage);
			String fileName = capitalize(category) + "Controller.java";
			controllerFiles.put(fileName, code);
		}
		return controllerFiles;
	}

	private String generateControllerClassCode(String category, List<ApiSpecEntity> specs, String basePackage) {
		StringBuilder sb = new StringBuilder();
		String className = capitalize(category) + "Controller";
		String serviceName = decapitalize(category) + "Service";
		String serviceType = capitalize(category) + "Service";

		// 패키지 및 import 선언
		sb.append("package ")
			.append(basePackage)
			.append(".")
			.append(category)
			.append(".controller;\n\n")
			.append("import lombok.RequiredArgsConstructor;\n")
			.append("import org.springframework.web.bind.annotation.*;\n")
			.append("import org.springframework.http.ResponseEntity;\n")
			.append("import org.springframework.http.HttpStatus;\n")
			.append("import ")
			.append(basePackage)
			.append(".")
			.append(category)
			.append(".service.")
			.append(serviceType)
			.append(";\n")
			.append("import javax.validation.Valid;\n\n");

		// 클래스 선언
		sb.append("@RestController\n")
			.append("@RequestMapping(\"/api/").append(category).append("\")\n")
			.append("@RequiredArgsConstructor\n")
			.append("public class ").append(className).append(" {\n\n")
			.append("    private final ").append(serviceType).append(" ").append(serviceName).append(";\n\n");

		// 각 API 명세 → 컨트롤러 메서드 생성
		for (ApiSpecEntity spec : specs) {
			sb.append(generateControllerMethod(spec, serviceName)).append("\n");
		}

		sb.append("}\n");
		return sb.toString();
	}

	private String generateControllerMethod(ApiSpecEntity spec, String serviceName) {
		StringBuilder sb = new StringBuilder();
		String apiName = spec.getApiName(); // 메서드명
		String path = spec.getEndpoint();   // URI 경로
		String method = spec.getMethod().name(); // GET, POST 등
		int statusCode = spec.getStatusCode();

		String httpAnnotation = switch (method) {
			case "GET" -> "@GetMapping";
			case "POST" -> "@PostMapping";
			case "PUT" -> "@PutMapping";
			case "DELETE" -> "@DeleteMapping";
			case "PATCH" -> "@PatchMapping";
			default -> "@RequestMapping";
		};

		// 반환 타입 결정
		String returnType = "Void";
		List<DtoEntity> dtos = dtoRepository.findByApiSpecId(spec.getId());
		for (DtoEntity dto : dtos) {
			if (dto.getDtoType() == DtoEntity.DtoType.RESPONSE) {
				returnType = dto.getDtoName();
				break;
			}
		}

		// 파라미터 선언 및 인자 리스트 구성
		List<String> paramLines = new ArrayList<>();
		List<String> argNames = new ArrayList<>();

		// PathVariable
		for (var pathVar : apiPathVariableRepository.findByApiSpec(spec)) {
			String key = pathVar.getPathVariable();
			String type = toJavaType(pathVar.getPathVariableDataType());
			paramLines.add("@PathVariable " + type + " " + key);
			argNames.add(key);
		}

		// QueryString
		for (var query : apiQueryStringRepository.findByApiSpec(spec)) {
			String key = query.getQueryStringVariable();
			String type = toJavaType(query.getQueryStringDataType());
			paramLines.add("@RequestParam " + type + " " + key);
			argNames.add(key);
		}

		// Request DTO
		for (DtoEntity dto : dtos) {
			if (dto.getDtoType() == DtoEntity.DtoType.REQUEST) {
				String className = dto.getDtoName();
				paramLines.add("@RequestBody @Valid " + className + " request");
				argNames.add("request");
				break;
			}
		}

		// 메서드 어노테이션 + 시그니처
		sb.append("    ").append(httpAnnotation).append("(\"").append(path).append("\")\n");
		sb.append("    public ResponseEntity<").append(returnType).append("> ").append(apiName).append("(");
		sb.append(String.join(", ", paramLines)).append(") {\n");

		// 서비스 호출부
		sb.append("        ");
		if (!returnType.equals("Void")) {
			sb.append(returnType).append(" result = ");
		}
		sb.append(serviceName)
			.append(".")
			.append(apiName)
			.append("(")
			.append(String.join(", ", argNames))
			.append(");\n");

		// 반환부
		sb.append("        return ResponseEntity.status(HttpStatus.valueOf(").append(statusCode).append("))");
		if (!returnType.equals("Void")) {
			sb.append(".body(result);\n");
		} else {
			sb.append(".build();\n");
		}

		sb.append("    }\n");
		return sb.toString();
	}

	private String capitalize(String str) {
		if (str == null || str.isEmpty())
			return str;
		return str.substring(0, 1).toUpperCase() + str.substring(1);
	}

	private String decapitalize(String str) {
		if (str == null || str.isEmpty())
			return str;
		return str.substring(0, 1).toLowerCase() + str.substring(1);
	}

	private String toJavaType(String dataType) {
		if (dataType == null)
			return "String";
		String type = dataType.trim();
		return switch (type) {
			case "Integer", "Long", "Short", "Byte", "Float", "Double",
				"Character", "Boolean", "String" -> type;
			case "LocalDate" -> "LocalDate";
			case "LocalDateTime" -> "LocalDateTime";
			case "ZonedDateTime" -> "ZonedDateTime";
			case "BigDecimal" -> "BigDecimal";
			case "BigInteger" -> "BigInteger";
			case "UUID" -> "UUID";
			default -> "String";
		};
	}
}
