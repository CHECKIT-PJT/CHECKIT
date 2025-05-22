package com.checkmate.checkit.projectbuilder.service;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.stereotype.Service;

import net.lingala.zip4j.ZipFile;

import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.exception.CommonException;
import lombok.extern.slf4j.Slf4j;

/**
 * ProjectZipService
 * - 생성된 프로젝트 디렉터리를 zip으로 압축합니다.
 */
@Slf4j
@Service
public class ProjectZipService {

	private static final String BASE_PATH = "/tmp/checkit/";

	/**
	 * 생성된 프로젝트를 zip 파일로 압축합니다.
	 * @param projectId 프로젝트 ID (디렉터리 기준)
	 * @param springName Spring 프로젝트 이름
	 * @return 압축된 zip 파일의 경로
	 */
	public Path zipProject(Integer projectId, String springName) {
		String projectDir = BASE_PATH + projectId + "/" + springName;
		String zipFilePath = BASE_PATH + projectId + "/" + springName + "-final.zip";

		try {
			// 기존 zip 파일이 있다면 삭제
			File zipFile = new File(zipFilePath);
			if (zipFile.exists()) {
				boolean deleted = zipFile.delete();
				log.info("[Zip] 기존 zip 삭제 여부: {}", deleted);
			}

			// 압축 수행
			ZipFile zip = new ZipFile(zipFilePath);
			zip.addFolder(new File(projectDir));

			log.info("[Zip] 압축 완료: {}", zipFilePath);
			return Paths.get(zipFilePath);
		} catch (Exception e) {
			log.error("[Zip] 프로젝트 압축 실패", e);
			throw new CommonException(ErrorCode.SPRING_PROJECT_ZIP_FAILED);
		}
	}
}
