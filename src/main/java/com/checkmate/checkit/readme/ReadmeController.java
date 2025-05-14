package com.checkmate.checkit.readme;

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
import org.springframework.web.bind.annotation.RestController;

import com.checkmate.checkit.global.code.SuccessCode;
import com.checkmate.checkit.global.response.JSONResponse;
import com.checkmate.checkit.readme.dto.ReadmeCreateRequest;
import com.checkmate.checkit.readme.dto.ReadmeUpdateRequest;
import com.checkmate.checkit.readme.dto.ReadmeResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequestMapping("/api/project")
@RestController
@RequiredArgsConstructor
public class ReadmeController {

	private final ReadmeService readmeService;

	// readme 생성
	@PostMapping("/{projectId}/readme/generate")
	public ResponseEntity<JSONResponse<ReadmeResponse>> generateReadme(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId) {

		String token = authorization.substring(7);
		ReadmeResponse readmeResponse = readmeService.generateReadme(token, projectId);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, readmeResponse));
	}

	// readme 저장
	@PostMapping("/{projectId}/readme")
	public ResponseEntity<JSONResponse<Void>> saveReadme(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId,
		@RequestBody @Valid ReadmeCreateRequest request) {

		String token = authorization.substring(7);
		readmeService.saveReadme(token, projectId, request.content());

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	// readme 조회
	@GetMapping("/{projectId}/readme")
	public ResponseEntity<JSONResponse<ReadmeResponse>> getReadme(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId) {

		String token = authorization.substring(7);

		ReadmeResponse readmeResponse = readmeService.getReadme(token, projectId);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, readmeResponse));
	}

	// readme 다운
	@GetMapping("/{projectId}/readme/download")
	public ResponseEntity<Resource> downloadReadme(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId) {

		String token = authorization.substring(7);
		String markdown = readmeService.getReadme(token, projectId).getReadme();

		ByteArrayResource resource = new ByteArrayResource(markdown.getBytes(StandardCharsets.UTF_8));
		return ResponseEntity.ok()
			.contentType(MediaType.TEXT_MARKDOWN)
			.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=README.md")
			.body(resource);
	}

	// readme 수정
	@PutMapping("/{projectId}/readme")
	public ResponseEntity<JSONResponse<Void>> updateReadme(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId,
		@RequestBody @Valid ReadmeUpdateRequest readmeUpdateRequest) {

		String token = authorization.substring(7);

		readmeService.updateReadme(token, projectId, readmeUpdateRequest);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	// readme 삭제
	@DeleteMapping("/{projectId}/readme")
	public ResponseEntity<JSONResponse<Void>> deleteReadme(
		@RequestHeader("Authorization") String authorization,
		@PathVariable Integer projectId) {

		String token = authorization.substring(7);

		readmeService.deleteReadme(token, projectId);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}
}
