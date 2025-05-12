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
import lombok.RequiredArgsConstructor;

/**
 * 현재 해당 코드는 API 명세서를 기반으로 Java Dto를 자동 생성하는 서비스 클래스이다.
 * - DtoEntity, DtoItemEntity, ApiQueryStringEntity 등을 기반으로 DTO 코드를 생성하며
 * - 프론트에서 허용한 16가지 데이터 타입만을 타입 변환을 지원하도록 한다.
 * - Request/Response DTO: Dtos + DtoItems 기반 생성
 * - Query DTO : Api QueryStrings 기반 생성
 */
@Service
@RequiredArgsConstructor
public class DtoGenerateService {

	// 각 Repository 주입
	private final ApiSpecRepository apiSpecRepository;
	private final DtoRepository dtoRepository;
	private final DtoItemRepository dtoItemRepository;
	private final ApiQueryStringRepository apiQueryStringRepository;

	//import 중복 방지용 Set 및 누적 StringBuilder
	private final Set<String> importSet = new HashSet<>();
	private StringBuilder imports = new StringBuilder();

	/**
	 * 하나의 프로젝트 내 모든 API 명세에 연결된 DTO들을 순회하여 Java 코드 형태로 생성한다.
	 * Request/Response DTO를 자동 생성한다.
	 *
	 * @param projectId   대상 프로젝트 ID
	 * @param basePackage 패키지 경로 (현재 사용하지 않지만 확장 가능)
	 * @return Map<파일명, Java 코드 문자열>
	 */
	public Map<String, String> generateDtos(int projectId, String basePackage) {
		Map<String, String> dtoFiles = new HashMap<>();

		// 프로젝트에 연결된 모든 API 명세 조회
		List<ApiSpecEntity> apiSpecs = apiSpecRepository.findAllByProjectId_Id(projectId);

		for (ApiSpecEntity apiSpec : apiSpecs) {
			Long apiSpecId = apiSpec.getId();

			//API 명세서에 연결된 모든 DTO 목록 조회
			List<DtoEntity> dtoList = dtoRepository.findByApiSpecId(apiSpecId);

			for (DtoEntity dto : dtoList) {
				String className = dto.getDtoName();// class 명
				List<DtoItemEntity> dtoItems = new ArrayList<>(dtoItemRepository.findByDto(dto));

				//Request 타입일 경우 쿼리 스트링 정보도 병합
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
				dtoFiles.put(className + ".java", dtoCode);
			}

		}

		return dtoFiles;
	}

	/**
	 * 쿼리스트링만 따로 사용하는 DTO 생성기
	 * - 이름: {ApiName}QueryDto
	 * - 항목: ApiQueryStringEntity
	 */

	public Map<String, String> generateQueryDtos(int projectId) {
		Map<String, String> dtoFiles = new HashMap<>();

		List<ApiSpecEntity> apiSpecs = apiSpecRepository.findAllByProjectId_Id(projectId);

		for (ApiSpecEntity apiSpec : apiSpecs) {
			List<ApiQueryStringEntity> queryStrings = apiQueryStringRepository.findByApiSpec(apiSpec);
			if (queryStrings.isEmpty())
				continue;

			String className = toClassName(apiSpec.getApiName() + "QueryDto");

			List<SimpleField> fields = queryStrings.stream()
				.map(q -> new SimpleField(q.getQueryStringVariable(),
					q.getQueryStringDataType()))
				.toList();

			String dtoCode = generateSimpleDtoClass(className, fields);
			dtoFiles.put(className + ".java", dtoCode);
		}
		return dtoFiles;

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
	// 간단한 필드 구조 표현 (쿼리 DTO용)

	/**
	 * API 명세 이름을 Java 클래스 명으로 변환
	 * 예: "create-user" → "CreateUser"
	 */
	private String toClassName(String apiName) {
		String[] parts = apiName.split("[_\\-\\s]"); // -, _, 공백 기준 분리
		StringBuilder sb = new StringBuilder();
		for (String part : parts) {
			if (!part.isEmpty()) {
				sb.append(part.substring(0, 1).toUpperCase()).append(part.substring(1));
			}
		}
		return sb.toString();
	}

	/**
	 * 실제 DTO Java 코드를 생성하는 메서드
	 * @param className : 생성할 DTO 클래스 이름
	 * @param fields : 필드 정보 리스트 (요청/응답 모두 ApiField 구현체)
	 */
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
