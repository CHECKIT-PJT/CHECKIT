package com.checkmate.checkit.codegenerator.controller;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.checkmate.checkit.codegenerator.service.DtoGenerateService;
import com.checkmate.checkit.codegenerator.service.EntityGenerateService;
import com.checkmate.checkit.codegenerator.service.ServiceGenerateService;
import com.checkmate.checkit.erd.dto.response.ErdRelationshipResponse;
import com.checkmate.checkit.erd.dto.response.ErdSnapshotResponse;
import com.checkmate.checkit.erd.dto.response.ErdTableResponse;
import com.checkmate.checkit.erd.mapper.ErdJsonConverter;
import com.checkmate.checkit.erd.service.ErdService;
import com.checkmate.checkit.springsettings.service.SpringSettingsService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/generate")
@RequiredArgsConstructor
public class CodeGenerateController {

	private final EntityGenerateService entityGenerateService;
	private final ErdService erdService;
	private final SpringSettingsService springSettingsService;
	private final DtoGenerateService dtoGenerateService;
	private final ServiceGenerateService serviceGenerateService;

	// 엔티티 코드 생성을 위한 엔드포인트
	@PostMapping("/build/{projectId}")
	public ResponseEntity<String> generateEntityCode(@PathVariable int projectId) throws IOException {
		//사용자가 지정한 base package  가져오기
//		String basePackage = Optional.ofNullable(
//			springSettingsService.getSpringSettings(projectId).getSpringPackageName()
//		).orElseThrow(() -> new IllegalStateException("springPackageName이 null입니다. Spring 설정을 확인하세요."));

		// ERD 데이터 가져오기
		ErdSnapshotResponse erdData = erdService.getErdByProjectId(projectId);
		ErdJsonConverter.ErdSnapshotDto erdSnapshotDto = ErdJsonConverter.convertFromJson(erdData.getErdJson());
		List<ErdTableResponse> tables = erdSnapshotDto.getTables();
		List<ErdRelationshipResponse> allRelationships = erdSnapshotDto.getRelationships();

		// 전체 결과 문자열
		StringBuilder codeResult = new StringBuilder();

		// 1. 엔티티 코드 생성
		for (ErdTableResponse table : tables) {
			// 해당 테이블과 관련된 관계만 필터링
			List<ErdRelationshipResponse> tableRelationships = allRelationships.stream()
				.filter(r ->
					r.getSourceTableId().equals(table.getId()) ||
						r.getTargetTableId().equals(table.getId())
				).toList();

			// 해당 테이블에 대한 엔티티 코드 생성
			String entityCodeForTable = entityGenerateService.generateEntityCode(
				table,
				table.getColumns(),
				tableRelationships,
				"basePackage"
			);
			codeResult.append(entityCodeForTable).append("\n");
		}

		// 2. Request/Response DTO 코드 생성
		dtoGenerateService.generateDtos(projectId, "basePackage").forEach((fileName, content) -> {
			codeResult.append(content).append("\n");
		});

		// 3. Query DTO 코드 생성
		dtoGenerateService.generateQueryDtos(projectId).forEach((fileName, content) -> {
			codeResult.append(content).append("\n");
		});

		// 4. Service 클래스
		serviceGenerateService.generateServiceCodeByCategory(projectId, "basePackage")
			.forEach((category, content) -> codeResult.append(content).append("\n"));

		// 최종 코드 반환
		return ResponseEntity.ok(codeResult.toString());
	}

}
