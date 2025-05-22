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
import com.checkmate.checkit.api.repository.ApiPathVariableRepository;
import com.checkmate.checkit.api.repository.ApiQueryStringRepository;
import com.checkmate.checkit.api.repository.ApiSpecRepository;
import com.checkmate.checkit.api.repository.DtoItemRepository;
import com.checkmate.checkit.api.repository.DtoRepository;
import com.checkmate.checkit.codegenerator.util.StringUtils;
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

			String className = StringUtils.toPascalCase(category) + "Controller";
			String filePath = category.toLowerCase() + "/controller/" + className + ".java";
			String code = generateControllerClassCode(category, specs, basePackage);

			controllerFiles.put(filePath, code);
		}
		return controllerFiles;
	}

	private String generateControllerClassCode(String category, List<ApiSpecEntity> specs, String basePackage) {
		StringBuilder sb = new StringBuilder();
		Set<String> importSet = new HashSet<>();
		List<String> importLines = new ArrayList<>();

		String domain = category.toLowerCase();
		String className = StringUtils.toPascalCase(category) + "Controller";
		String serviceType = StringUtils.toPascalCase(category) + "Service";
		String serviceName = StringUtils.toCamelCase(category) + "Service";

		sb.append("package ")
			.append(basePackage).append(".").append(domain).append(".controller;").append("\n\n");

		addImport(importSet, importLines, "import lombok.RequiredArgsConstructor;");
		addImport(importSet, importLines, "import org.springframework.web.bind.annotation.*;");
		addImport(importSet, importLines, "import org.springframework.http.ResponseEntity;");
		addImport(importSet, importLines, "import org.springframework.http.HttpStatus;");
		addImport(importSet, importLines, "import " + basePackage + "." + domain + ".service." + serviceType + ";");
		addImport(importSet, importLines, "import " + basePackage + "." + domain + ".dto.*;");
		addImport(importSet, importLines, "import javax.validation.Valid;");

		for (String imp : importLines) {
			sb.append(imp).append("\n");
		}

		sb.append("\n@RestController\n")
			// .append("@RequestMapping(\"/api/").append(domain).append("\")\n")
			.append("@RequiredArgsConstructor\n")
			.append("public class ").append(className).append(" {\n\n")
			.append("    private final ").append(serviceType).append(" ").append(serviceName).append(";\n\n");

		for (ApiSpecEntity spec : specs) {
			sb.append(generateControllerMethod(spec, serviceName)).append("\n");
		}

		sb.append("}\n");
		return sb.toString();
	}

	private void addImport(Set<String> set, List<String> list, String imp) {
		if (set.add(imp)) {
			list.add(imp);
		}
	}

	private String generateControllerMethod(ApiSpecEntity spec, String serviceName) {
		StringBuilder sb = new StringBuilder();
		String methodName = StringUtils.toCamelCase(spec.getApiName());
		String path = spec.getEndpoint();
		String method = spec.getMethod().name();
		int statusCode = spec.getStatusCode();

		String httpAnnotation = switch (method) {
			case "GET" -> "@GetMapping";
			case "POST" -> "@PostMapping";
			case "PUT" -> "@PutMapping";
			case "DELETE" -> "@DeleteMapping";
			case "PATCH" -> "@PatchMapping";
			default -> "@RequestMapping";
		};

		String returnType = "Void";
		List<DtoEntity> dtos = dtoRepository.findByApiSpecId(spec.getId());
		for (DtoEntity dto : dtos) {
			if (dto.getDtoType() == DtoEntity.DtoType.RESPONSE) {
				returnType = StringUtils.toPascalCase(dto.getDtoName());
				break;
			}
		}

		List<String> paramLines = new ArrayList<>();
		List<String> argNames = new ArrayList<>();

		List<ApiPathVariableEntity> pathVars = apiPathVariableRepository.findByApiSpec(spec);
		for (ApiPathVariableEntity pathVar : pathVars) {
			String key = pathVar.getPathVariable();
			String type = toJavaType(pathVar.getPathVariableDataType());
			paramLines.add("@PathVariable " + type + " " + key);
			argNames.add(key);
		}

		List<ApiQueryStringEntity> queryParams = apiQueryStringRepository.findByApiSpec(spec);
		for (ApiQueryStringEntity query : queryParams) {
			String key = query.getQueryStringVariable();
			String type = toJavaType(query.getQueryStringDataType());
			paramLines.add("@RequestParam " + type + " " + key);
			argNames.add(key);
		}

		for (DtoEntity dto : dtos) {
			if (dto.getDtoType() == DtoEntity.DtoType.REQUEST) {
				String className = StringUtils.toPascalCase(dto.getDtoName());
				paramLines.add("@RequestBody @Valid " + className + " request");
				argNames.add("request");
				break;
			}
		}

		sb.append("    ").append(httpAnnotation).append("(\"").append(path).append("\")\n");
		sb.append("    public ResponseEntity<").append(returnType).append("> ").append(methodName).append("(")
			.append(String.join(", ", paramLines)).append(") {\n");

		sb.append("        ");
		if (!returnType.equals("Void")) {
			sb.append(returnType).append(" result = ");
		}
		sb.append(serviceName).append(".").append(methodName).append("(")
			.append(String.join(", ", argNames)).append(");\n");

		sb.append("        return ResponseEntity.status(HttpStatus.valueOf(").append(statusCode).append(")");
		if (!returnType.equals("Void")) {
			sb.append(".body(result));\n");
		} else {
			sb.append(".build());\n");
		}

		sb.append("    }\n");
		return sb.toString();
	}

	private String toJavaType(String dataType) {
		if (dataType == null)
			return "String";
		return switch (dataType.trim()) {
			case "Integer", "Long", "Short", "Byte", "Float", "Double",
				"Character", "Boolean", "String" -> dataType.trim();
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
