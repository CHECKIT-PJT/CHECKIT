package com.checkmate.checkit.projectbuilder.service;

import java.io.IOException;
import java.nio.file.Path;

import org.springframework.stereotype.Service;

import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.exception.CommonException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectBuildAndZipService {

	private final ProjectBuilderService projectBuilderService;
	private final ProjectZipService projectZipService;

	/**
	 * 전체 Spring 프로젝트 생성 후 최종 zip 파일로 압축
	 * @return 압축된 zip 파일의 Path
	 */
	public Path buildAndZip(int projectId, String springName) {
		try {
			// 1. 프로젝트 다운로드 및 코드 생성 및 저장
			projectBuilderService.buildProject(projectId);

			// 2. zip 압축
			return projectZipService.zipProject(projectId, springName);
		} catch (IOException e) {
			throw new CommonException(ErrorCode.SPRING_PROJECT_BUILD_FAILED);
		}
	}
}
