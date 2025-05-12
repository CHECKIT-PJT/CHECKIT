package com.checkmate.checkit.codegenerator.model;

import java.util.List;

/**
 * ERD의 테이블 정보를 담는 최소 단위 DTO
 * - name: 테이블명 (물리명, 예: "User")
 * - columns: 이 테이블에 속한 컬럼 리스트
 */
public record MinimalTable(
	String name,
	List<MinimalColumn> columns
) {
}
