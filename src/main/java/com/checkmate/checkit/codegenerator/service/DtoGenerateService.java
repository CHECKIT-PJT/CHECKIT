package com.checkmate.checkit.codegenerator.service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.checkmate.checkit.api.entity.ApiRequestParamEntity;
import com.checkmate.checkit.api.entity.ApiResponseEntity;
import com.checkmate.checkit.api.entity.ApiSpecEntity;
import com.checkmate.checkit.api.repository.ApiRequestParamRepository;
import com.checkmate.checkit.api.repository.ApiResponseRepository;
import com.checkmate.checkit.api.repository.ApiSpecRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DtoGenerateService {

	// 각 Repository 주입: API 명세, 요청 파라미터, 응답 필드 정보를 가져오기 위함
	private final ApiSpecRepository apiSpecRepository;
	private final ApiRequestParamRepository apiRequesParamRepository;
	private final ApiResponseRepository apiResponseRepository;

	// DTO 클래스에 필요한 import 구문들을 누적 저장
	private final Set<String> importSet = new HashSet<>();
	private StringBuilder imports = new StringBuilder();

	/**
	 * 하나의 프로젝트 내 모든 API 명세를 기반으로 Request/Response DTO 파일을 생성
	 * @param projectId : API 명세를 불러올 프로젝트 ID
	 * @param basePackage : 생성되는 DTO의 패키지 경로
	 * @return 파일명-내용으로 이루어진 Map<String, String>
	 */
	public Map<String, String> generateDtos(int projectId, String basePackage) {
		Map<String, String> dtoFiles = new HashMap<>();

		// 특정 프로젝트의 모든 API 명세 조회
		List<ApiSpecEntity> apiSpecs = apiSpecRepository.findAllByProjectId_Id(projectId);

		for (ApiSpecEntity api : apiSpecs) {
			// API 이름 기반으로 DTO 클래스명 생성 (예: create-user → CreateUser)
			String baseName = toClassName(api.getApiName());

			// 해당 API의 요청 파라미터 가져오기
			List<ApiRequestParamEntity> reqParams = apiRequesParamRepository.findAllByApiSpec(api);
			String requestDto = generateDtoClass(baseName + "RequestDto", reqParams);
			dtoFiles.put(baseName + "RequestDto.java", requestDto);

			// 해당 API의 응답 정보 가져오기
			List<ApiResponseEntity> resParams = apiResponseRepository.findAllByApiSpec(api);
			String responseDto = generateDtoClass(baseName + "ResponseDto", resParams);
			dtoFiles.put(baseName + "ResponseDto.java", responseDto);
		}

		return dtoFiles;
	}

	/**
	 * API 명세 이름을 Java 클래스 명으로 변환
	 * 예: "create-user" → "CreateUser"
	 */
	private String toClassName(String apiName) {
		String[] parts = apiName.split("[_\\-\\s]"); // -, _, 공백 기준 분리
		return Arrays.stream(parts)
			.filter(part -> !part.isEmpty())
			.map(p -> p.substring(0, 1).toUpperCase() + p.substring(1)) // 첫 글자 대문자 변환
			.collect(Collectors.joining());
	}

	/**
	 * 실제 DTO Java 코드를 생성하는 메서드
	 * @param className : 생성할 DTO 클래스 이름
	 * @param fields : 필드 정보 리스트 (요청/응답 모두 ApiField 구현체)
	 */
	private String generateDtoClass(String className, List<? extends ApiField> fields) {
		// import 초기화
		importSet.clear();
		imports.setLength(0);

		StringBuilder sb = new StringBuilder();

		// Lombok 및 누적된 import 구문 추가
		addImport("import lombok.*;");
		sb.append(imports).append("\n");

		// 클래스 어노테이션
		sb.append("@Getter\n@Setter\n@NoArgsConstructor\n@AllArgsConstructor\n@Builder\n");
		sb.append("public class ").append(className).append(" {\n\n");

		// 각 필드에 대한 선언
		for (ApiField field : fields) {
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

		String upper = dataType.toUpperCase();

		// 숫자 타입
		if (upper.equals("BIGINT") || upper.equals("BIGINT(LONG)"))
			return "Long";
		if (upper.equals("INT") || upper.equals("INTEGER") || upper.equals("INT(INTEGER)"))
			return "Integer";
		if (upper.equals("SMALLINT") || upper.equals("SMALLINT(SHORT)"))
			return "Short";
		if (upper.equals("TINYINT") || upper.equals("TINYINT(BYTE)"))
			return "Byte";
		if (upper.startsWith("TINYINT") && upper.contains("(1)"))
			return "Boolean";
		if (upper.equals("FLOAT") || upper.equals("FLOAT(FLOAT)"))
			return "Float";
		if (upper.equals("DOUBLE") || upper.equals("DOUBLE(DOUBLE)"))
			return "Double";

		// 문자 타입
		if (upper.equals("CHAR") || upper.equals("CHAR(CHARACTER)"))
			return "Character";
		if (upper.matches("VARCHAR|TEXT|LONGTEXT|MEDIUMTEXT|STRING"))
			return "String";

		// 불리언
		if (upper.equals("BOOLEAN") || upper.equals("BOOL"))
			return "Boolean";

		// 날짜/시간
		if (upper.equals("DATE")) {
			addImport("import java.time.LocalDate;");
			return "LocalDate";
		}
		if (upper.equals("DATETIME") || upper.equals("TIMESTAMP")) {
			addImport("import java.time.LocalDateTime;");
			return "LocalDateTime";
		}
		if (upper.equals("TIME")) {
			addImport("import java.time.LocalTime;");
			return "LocalTime";
		}

		// 기타
		if (upper.equals("UUID") || upper.equals("UNIQUEIDENTIFIER")) {
			addImport("import java.util.UUID;");
			return "UUID";
		}
		if (upper.equals("DECIMAL") || upper.equals("NUMERIC")) {
			addImport("import java.math.BigDecimal;");
			return "BigDecimal";
		}
		if (upper.equals("BLOB") || upper.equals("LONGBLOB"))
			return "byte[]";

		// 기본값
		return "String";
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
	 * 공통 필드 인터페이스 - Request/Response 공통화
	 */
	public interface ApiField {
		String getFieldName();  // 예: "userName"

		String getDataType();   // 예: "VARCHAR"
	}
}
