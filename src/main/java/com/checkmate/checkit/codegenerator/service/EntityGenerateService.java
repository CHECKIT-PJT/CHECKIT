package com.checkmate.checkit.codegenerator.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.checkmate.checkit.erd.dto.response.ErdColumnResponse;
import com.checkmate.checkit.erd.dto.response.ErdRelationshipResponse;
import com.checkmate.checkit.erd.dto.response.ErdTableResponse;

@Service
public class EntityGenerateService {

	private StringBuilder imports = new StringBuilder(); // Entity 클래스에서 필요한 import 문들을 누적 저장
	private Set<String> importSet = new HashSet<>(); // 중복 import 방지용 Set

	/**
	 * 하나의 ERD 컬럼 정보를 기반으로 자바 필드 선언 코드를 생성
	 * 예:
	 *   @Column(name = "user_name", nullable = false)
	 *   private String userName;
	 */
	public String generateField(ErdColumnResponse column) {
		StringBuilder fieldCode = new StringBuilder();

		// 1. 기본키(Primary Key)인 경우: @Id, @GeneratedValue 추가
		if (column.isPrimaryKey()) {
			fieldCode.append("    @Id\n");
			fieldCode.append("    @GeneratedValue(strategy = GenerationType.IDENTITY)\n");

			// 관련 import 추가 (중복 방지)
			addImport("import jakarta.persistence.Id;");
			addImport("import jakarta.persistence.GeneratedValue;");
			addImport("import jakarta.persistence.GenerationType;");
		}

		// 2. @Column 어노테이션 설정
		fieldCode.append("    @Column(name = \"").append(column.getColPhysicName()).append("\"");
		if (!column.isNullable()) {
			fieldCode.append(", nullable = false");
		}

		// defaultValue가 존재할 경우 columnDefinition 추가
		if (column.getDefaultValue() != null && !column.getDefaultValue().isBlank()) {
			String dataType = column.getDataType().toUpperCase();
			String defaultVal = column.getDefaultValue().trim();

			// 문자열이면 작은 따옴표 붙이기
			if (dataType.contains("CHAR") || dataType.contains("TEXT") || dataType.contains("VARCHAR")) {
				defaultVal = "'" + defaultVal + "'";
			}

			fieldCode.append(", columnDefinition = \"")
				.append(dataType.split("\\(")[0]) // VARCHAR(255) → VARCHAR
				.append(" DEFAULT ").append(defaultVal).append("\"");
		}
		fieldCode.append(")\n");

		// @Column import 추가 (중복 방지)
		addImport("import jakarta.persistence.Column;");

		// 3. 실제 필드 선언 (ex: private String userName;)
		String javaType = toJavaType(column.getDataType());
		String fieldName = toCamelCase(column.getColPhysicName());
		fieldCode.append("    private ").append(javaType).append(" ").append(fieldName).append(";\n\n");

		return fieldCode.toString();
	}

	/**
	 * 하나의 테이블과 그에 속한 컬럼 리스트를 바탕으로 Entity 전체 클래스 코드를 생성
	 *
	 * @param table        ERD 테이블 정보
	 * @param columns      해당 테이블에 포함된 컬럼 리스트
	 * @param relationships 해당 테이블의 연관관계 리스트
	 * @param basePackage  생성할 클래스의 기본 패키지 이름
	 * @return 완성된 자바 Entity 클래스 코드
	 */
	public String generateEntityCode(ErdTableResponse table, List<ErdColumnResponse> columns,
		List<ErdRelationshipResponse> relationships, String basePackage) {
		StringBuilder sb = new StringBuilder();
		imports = new StringBuilder(); // 매번 새롭게 초기화
		importSet.clear(); // 중복 방지 Set 초기화

		// 1. package 선언
		sb.append("package ").append(basePackage).append(".entity;\n\n");

		// 2. import 구문 선언
		addImport("import jakarta.persistence.Entity;");
		addImport("import jakarta.persistence.Table;");
		addImport("import lombok.*;");
		sb.append(imports).append("\n");

		// 3. 클래스에 붙일 어노테이션
		sb.append("@Entity\n");
		sb.append("@Table(name = \"").append(table.getTblPhysicName().toLowerCase()).append("\")\n");
		sb.append("@Getter\n@Setter\n@NoArgsConstructor\n@AllArgsConstructor\n@Builder\n");

		// 4. 클래스 선언
		sb.append("public class ").append(table.getTblPhysicName()).append(" {\n\n");

		// 5. 각 필드 생성
		for (ErdColumnResponse column : columns) {
			sb.append(generateField(column));
		}

		// 6. 연관관계 생성
		for (ErdRelationshipResponse relation : relationships) {
			sb.append(generateRelationField(relation, table.getTblPhysicName()));
		}

		// 7. 클래스 닫기
		sb.append("}\n");

		return sb.toString();
	}

	/**
	 * DB의 데이터 타입을 Java 타입으로 변환합니다.
	 * + 해당 타입이 필요한 경우 자동으로 import 문도 추가합니다.
	 */
	private String toJavaType(String dataType) {
		if (dataType == null)
			return "String";

		String upper = dataType.toUpperCase();

		// 숫자 타입 매핑
		if (upper.equals("BIGINT") || upper.equals("BIGINT(LONG)"))
			return "Long";
		if (upper.equals("INT") || upper.equals("INTEGER") || upper.equals("INT(INTEGER)"))
			return "Integer";
		if (upper.equals("SMALLINT") || upper.equals("SMALLINT(SHORT)"))
			return "Short";
		if (upper.equals("TINYINT") || upper.equals("TINYINT(BYTE)"))
			return "Byte";
		if (upper.equals("FLOAT") || upper.equals("FLOAT(FLOAT)"))
			return "Float";
		if (upper.equals("DOUBLE") || upper.equals("DOUBLE(DOUBLE)"))
			return "Double";

		// 문자 타입 매핑
		if (upper.equals("CHAR") || upper.equals("CHAR(CHARACTER)"))
			return "Character";
		if (upper.matches("VARCHAR|TEXT|LONGTEXT|MEDIUMTEXT|STRING"))
			return "String";

		// 불리언
		if (upper.equals("BOOLEAN") || upper.equals("BOOL"))
			return "Boolean";

		// 날짜/시간
		if (upper.equals("DATE")) {
			if (!imports.toString().contains("java.time.LocalDate")) {
				addImport("import java.time.LocalDate;");
			}
			return "LocalDate";
		}

		if (upper.equals("DATETIME") || upper.equals("TIMESTAMP")) {
			if (!imports.toString().contains("java.time.LocalDateTime")) {
				addImport("import java.time.LocalDateTime;");
			}
			return "LocalDateTime";
		}

		if (upper.equals("TIME")) {
			if (!imports.toString().contains("java.time.LocalTime")) {
				addImport("import java.time.LocalTime;");
			}
			return "LocalTime";
		}

		// 기타
		if (upper.equals("UUID") || upper.equals("UNIQUEIDENTIFIER")) {
			if (!imports.toString().contains("java.util.UUID")) {
				addImport("import java.util.UUID;");
			}
			return "UUID";
		}

		if (upper.equals("DECIMAL") || upper.equals("NUMERIC")) {
			if (!imports.toString().contains("java.math.BigDecimal")) {
				addImport("import java.math.BigDecimal;");
			}
			return "BigDecimal";
		}

		if (upper.equals("BLOB") || upper.equals("LONGBLOB"))
			return "byte[]";

		// 기본값
		return "String";
	}

	/**
	 * 예: "user_name" → "userName"
	 */
	private String toCamelCase(String text) {
		if (text == null)
			return "";
		String[] parts = text.split("_");
		StringBuilder camel = new StringBuilder(parts[0]);
		for (int i = 1; i < parts.length; i++) {
			camel.append(parts[i].substring(0, 1).toUpperCase()).append(parts[i].substring(1));
		}
		return camel.toString();
	}

	/**
	 * 누적된 import 구문을 가져옵니다.
	 */
	public String getImportStatements() {
		return imports.toString();
	}

	/**
	 * 연관관계 필드를 생성합니다.
	 * (1:N, N:1, 1:1 관계에 대한 필드 생성)
	 */
	public String generateRelationField(ErdRelationshipResponse relation, String tableName) {
		StringBuilder fieldCode = new StringBuilder();

		// 1. 1:N 관계 (OneToMany, ManyToOne)
		if (relation.getRelationshipType().equals("1:N") || relation.getRelationshipType().equals("N:1")) {
			// Source 테이블이 OneToMany 관계를 가질 경우
			if (tableName.equals(relation.getSourceTableId())) {
				fieldCode.append("    @OneToMany(mappedBy = \"")
					.append(relation.getLogicalName())  // 논리적 이름
					.append(")\n");
				fieldCode.append("    private List<")
					.append(relation.getTargetTableId()) // 대상 테이블
					.append("> ")
					.append(relation.getTargetTableId().toString().toLowerCase())
					.append("List = new ArrayList<>();\n\n");
			}
			// Target 테이블이 ManyToOne 관계를 가질 경우
			else {
				fieldCode.append("    @ManyToOne\n");
				fieldCode.append("    @JoinColumn(name = \"")
					.append(relation.getSourceTableId())  // 외래키 설정
					.append("_id\")\n");
				fieldCode.append("    private ")
					.append(relation.getSourceTableId().toString())
					.append(" ")
					.append(relation.getSourceTableId().toString().toLowerCase())
					.append(";\n\n");
			}
		}

		// 2. 1:1 관계 (OneToOne)
		if (relation.getRelationshipType().equals("1:1")) {
			// 1:1 관계에서 양쪽 테이블은 모두 OneToOne 관계를 가짐
			if (tableName.equals(relation.getSourceTableId())) {
				fieldCode.append("    @OneToOne\n");
				fieldCode.append("    @JoinColumn(name = \"")
					.append(relation.getTargetTableId())  // 외래키 설정
					.append("_id\")\n");
				fieldCode.append("    private ")
					.append(relation.getTargetTableId().toString())
					.append(" ")
					.append(relation.getTargetTableId().toString().toLowerCase())
					.append(";\n\n");
			} else {
				fieldCode.append("    @OneToOne\n");
				fieldCode.append("    @JoinColumn(name = \"")
					.append(relation.getSourceTableId())  // 외래키 설정
					.append("_id\")\n");
				fieldCode.append("    private ")
					.append(relation.getSourceTableId().toString())
					.append(" ")
					.append(relation.getSourceTableId().toString().toLowerCase())
					.append(";\n\n");
			}
		}

		// 3. ManyToMany 관계
		if (relation.getRelationshipType().equals("M:N")) {
			fieldCode.append("    @ManyToMany\n");
			fieldCode.append("    @JoinTable(name = \"")
				.append(relation.getSourceTableId())  // 중간 테이블 이름 설정
				.append("_")
				.append(relation.getTargetTableId())  // 대상 테이블 이름 설정
				.append("\", joinColumns = @JoinColumn(name = \"")
				.append(relation.getSourceTableId())  // Source 테이블의 외래키
				.append("_id\"), inverseJoinColumns = @JoinColumn(name = \"")
				.append(relation.getTargetTableId())  // Target 테이블의 외래키
				.append("_id\"))\n");
			fieldCode.append("    private Set<")
				.append(relation.getTargetTableId())
				.append("> ")
				.append(relation.getTargetTableId().toString().toLowerCase())
				.append("s = new HashSet<>();\n\n");
		}

		return fieldCode.toString();
	}

	// 중복된 import 문을 추가하지 않도록 관리
	private void addImport(String importStatement) {
		if (!importSet.contains(importStatement)) {
			imports.append(importStatement).append("\n");
			importSet.add(importStatement);
		}
	}

}
