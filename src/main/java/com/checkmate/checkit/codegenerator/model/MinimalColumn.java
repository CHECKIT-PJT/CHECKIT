package com.checkmate.checkit.codegenerator.model;

/**
 * ERD의 컬럼 정보를 담는 최소 단위 DTO
 * - name: 컬럼명 (물리명, 예: "user_id")
 * - type: 데이터 타입 (예: "VARCHAR", "BIGINT")
 * - isPrimaryKey: 해당 컬럼이 PK인지 여부
 * - isNullable: null 허용 여부
 * - defaultValue: 기본값 (없으면 빈 문자열)
 */
public record MinimalColumn(
	String name,
	String type,
	boolean isPrimaryKey,
	boolean isNullable,
	String defaultValue
) {
}
