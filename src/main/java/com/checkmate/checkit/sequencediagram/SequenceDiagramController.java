package com.checkmate.checkit.sequencediagram;

import java.nio.charset.StandardCharsets;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.checkmate.checkit.global.code.SuccessCode;
import com.checkmate.checkit.global.response.JSONResponse;
import com.checkmate.checkit.sequencediagram.dto.SequenceDiagramCreateRequest;
import com.checkmate.checkit.sequencediagram.dto.SequenceDiagramUpdateRequest;
import com.checkmate.checkit.sequencediagram.dto.SequenceDiagramResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequestMapping("/api/project")
@RestController
@RequiredArgsConstructor
public class SequenceDiagramController {
	private final SequenceDiagramService sequenceDiagramService;

	// Sequence Diagram 생성
	@PostMapping("/{projectId}/sequence/generate")
	public ResponseEntity<JSONResponse<SequenceDiagramResponse>> generateSequenceDiagram(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId,
		@RequestParam String category) {

		String token = authorization.substring(7);
		SequenceDiagramResponse result = sequenceDiagramService.generateSequenceDiagram(token, projectId, category);
		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, result));
	}
	// Sequence Diagram 저장
	@PostMapping("/{projectId}/sequence")
	public ResponseEntity<JSONResponse<Void>> createSequenceDiagram(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId,
		@RequestBody @Valid SequenceDiagramCreateRequest request) {

		String token = authorization.substring(7);
		sequenceDiagramService.saveSequenceDiagram(token, projectId, request.content(), request.diagramUrl());
		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	// Sequence Diagram 코드 다운로드 (PlantUML 파일)
	@GetMapping("/{projectId}/sequence/download/code")
	public ResponseEntity<Resource> downloadSequenceDiagramCode(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId) {

		String token = authorization.substring(7);
		String content = sequenceDiagramService.getSequenceDiagram(token, projectId).getContent();

		ByteArrayResource resource = new ByteArrayResource(content.getBytes(StandardCharsets.UTF_8));
		return ResponseEntity.ok()
			.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sequence_diagram.puml")
			.contentType(MediaType.TEXT_PLAIN)
			.body(resource);
	}

	// Sequence Diagram 이미지 다운로드 (URL 통해 PNG 파일 직접 반환)
	@GetMapping("/{projectId}/sequence/download/image")
	public ResponseEntity<Resource> downloadSequenceDiagramImage(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId) {

		String token = authorization.substring(7);
		String imageUrl = sequenceDiagramService.getSequenceDiagram(token, projectId).getDiagramUrl();

		try (var in = new java.net.URL(imageUrl).openStream()) {
			byte[] imageBytes = in.readAllBytes();
			ByteArrayResource resource = new ByteArrayResource(imageBytes);
			return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sequence_diagram.png")
				.contentType(MediaType.IMAGE_PNG)
				.body(resource);
		} catch (Exception e) {
			throw new RuntimeException("이미지를 다운로드할 수 없습니다.", e);
		}
	}

	// Sequence Diagram 조회
	@GetMapping("/{projectId}/sequence")
	public ResponseEntity<JSONResponse<SequenceDiagramResponse>> getSequenceDiagram(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId) {

		String token = authorization.substring(7);
		SequenceDiagramResponse sequenceDiagramResponse = sequenceDiagramService.getSequenceDiagram(token, projectId);
		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, sequenceDiagramResponse));
	}

	// Sequence Diagram 수정
	@PutMapping("/{projectId}/sequence")
	public ResponseEntity<JSONResponse<Void>> updateSequenceDiagram(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId,
		@RequestBody @Valid  SequenceDiagramUpdateRequest request) {

		String token = authorization.substring(7);
		sequenceDiagramService.updateSequenceDiagram(token, projectId, request);
		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	// Sequence Diagram 삭제
	@DeleteMapping("/{projectId}/sequence")
	public ResponseEntity<JSONResponse<Void>> deleteSequenceDiagram(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId) {

		String token = authorization.substring(7);
		sequenceDiagramService.deleteSequenceDiagram(token, projectId);
		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}
}
