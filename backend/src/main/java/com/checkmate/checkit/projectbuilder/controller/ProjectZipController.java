package com.checkmate.checkit.projectbuilder.controller;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.exception.CommonException;
import com.checkmate.checkit.projectbuilder.service.ProjectZipService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/project-zip")
public class ProjectZipController {

	private final ProjectZipService projectZipService;

	/**
	 * GET /api/project-zip/download/{projectId}/{springName}
	 * 프로젝트 zip 파일을 생성하고 다운로드합니다.
	 */
	@GetMapping("/download/{projectId}/{springName}")
	public void downloadZip(
		@PathVariable Integer projectId,
		@PathVariable String springName,
		HttpServletResponse response
	) {
		try {
			// 1. zip 압축 수행
			Path zipPath = projectZipService.zipProject(projectId, springName);

			// 2. 파일 응답 헤더 설정
			File zipFile = zipPath.toFile();
			if (!zipFile.exists())
				throw new CommonException(ErrorCode.SPRING_PROJECT_ZIP_FAILED);

			response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
			response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
				"attachment; filename=\"" + zipFile.getName() + "\"");
			response.setContentLength((int)zipFile.length());

			// 3. 파일 내용 응답 스트림에 복사
			FileCopyUtils.copy(Files.newInputStream(zipPath), response.getOutputStream());

			log.info("[Download] 프로젝트 zip 파일 전송 완료: {}", zipFile.getAbsolutePath());
		} catch (Exception e) {
			log.error("[Error] 프로젝트 zip 다운로드 실패", e);
			throw new CommonException(ErrorCode.SPRING_PROJECT_ZIP_FAILED);
		}
	}
}
