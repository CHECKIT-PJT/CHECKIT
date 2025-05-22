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
import com.checkmate.checkit.projectbuilder.service.ProjectBuildAndZipService;
import com.checkmate.checkit.projectbuilder.service.ProjectBuilderService;
import com.checkmate.checkit.springsettings.dto.SpringSettingsDtoResponse;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/build")
public class ProjectBuildAndZipController {

	private final ProjectBuildAndZipService buildAndZipService;
	private final ProjectBuilderService projectBuilderService;

	/**
	 * GET /api/build/{projectId}/download
	 * 프로젝트 생성 및 압축 후 zip 다운로드
	 */
	@GetMapping("/{projectId}/download")
	public void buildAndDownloadZip(
		@PathVariable Integer projectId,
		HttpServletResponse response
	) {
		try {
			// springName 조회
			SpringSettingsDtoResponse springSettings = projectBuilderService.getSpringSettings(projectId);
			String springName = springSettings.getSpringName();

			// 빌드 및 압축 수행
			Path zipPath = buildAndZipService.buildAndZip(projectId, springName);
			File zipFile = zipPath.toFile();

			if (!zipFile.exists())
				throw new CommonException(ErrorCode.SPRING_PROJECT_ZIP_FAILED);

			// 응답 헤더 설정
			response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
			response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
				"attachment; filename=\"" + zipFile.getName() + "\"");
			response.setContentLength((int)zipFile.length());

			// 파일 전송
			FileCopyUtils.copy(Files.newInputStream(zipPath), response.getOutputStream());

			log.info("[Build+Download] zip 파일 생성 및 다운로드 완료: {}", zipPath);
		} catch (Exception e) {
			log.error("[Error] 프로젝트 build+zip 실패", e);
			throw new CommonException(ErrorCode.SPRING_PROJECT_BUILD_FAILED);
		}
	}
}
