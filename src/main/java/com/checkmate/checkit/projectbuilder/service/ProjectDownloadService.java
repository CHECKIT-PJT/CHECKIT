package com.checkmate.checkit.projectbuilder.service;

import java.io.File;
import java.net.URI;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.client.RestTemplate;

import net.lingala.zip4j.ZipFile;

import com.checkmate.checkit.projectbuilder.dto.InitializerRequest;
import com.checkmate.checkit.projectbuilder.util.FileUtil;
import lombok.extern.slf4j.Slf4j;

/**
 * ProjectDownloadService
 * - 사용자가 설정한 InitializerRequest를 기반으로 start.spring.io 에서 Spring 프로젝트 ZIP을 다운로드 받고,
 * - 서버 임시 디렉토리에 저장 후 압축을 해제합니다.
 */
@Slf4j
@Service
public class ProjectDownloadService {

	// 프로젝트가 다운로드 및 압축 해제될 기본 경로
	private static final String BASE_PATH = "/tmp/checkit/";

	/**
	 * start.spring.io에서 프로젝트 ZIP 파일을 다운로드하고 압축을 해제합니다.
	 * @param request 사용자 Spring 설정 정보가 포함된 요청 객체
	 */
	public void downloadAndExtract(InitializerRequest request) {
		String url = buildDownloadUrl(request); // 요청 URL 생성
		log.info("[Download] spring project from: {}", url);

		try {
			// 기존 동일 이름의 디렉터리가 있다면 삭제 (클린 상태 유지)
			FileUtil.deleteFolder(BASE_PATH + request.getSpringName());

			// start.spring.io로 요청 보냄
			URI uri = URI.create(url);
			RestTemplate rt = new RestTemplate();
			ResponseEntity<byte[]> response = rt.getForEntity(uri, byte[].class); // ZIP 파일 byte[]로 받기

			// 저장 디렉터리 없으면 생성
			File folder = new File(BASE_PATH);
			if (!folder.exists())
				folder.mkdirs();

			// ZIP 파일 저장 경로 정의 및 저장
			Path zipPath = Paths.get(BASE_PATH, request.getSpringName() + ".zip");
			FileCopyUtils.copy(response.getBody(), zipPath.toFile());

			// 저장된 ZIP 파일 압축 해제 (zip4j 사용)
			ZipFile zipFile = new ZipFile(zipPath.toFile());
			zipFile.extractAll(BASE_PATH + request.getSpringName());

			log.info("[Success] Extracted project to: {}", BASE_PATH + request.getSpringName());
		} catch (Exception e) {
			log.error("[Error] Failed to download or extract zip", e);
			throw new RuntimeException("Spring 프로젝트 다운로드 실패");
		}
	}

	/**
	 * start.spring.io 요청용 URL을 InitializerRequest 기반으로 조합합니다.
	 * @param req 사용자 설정 DTO
	 * @return 완성된 쿼리 파라미터 URL
	 */
	private String buildDownloadUrl(InitializerRequest req) {
		return "https://start.spring.io/starter.zip?"
			+ "type=" + req.getSpringType()
			+ "&language=" + req.getSpringLanguage()
			+ "&bootVersion=" + req.getSpringPlatformVersion()
			+ "&packaging=" + req.getSpringPackaging()
			+ "&javaVersion=" + req.getSpringJvmVersion()
			+ "&groupId=" + req.getSpringGroupId()
			+ "&artifactId=" + req.getSpringArtifactId()
			+ "&name=" + req.getSpringName()
			+ "&description=" + req.getSpringDescription().replaceAll(" ", "+")
			+ "&packageName=" + req.getSpringPackageName()
			+ "&dependencies=" + req.getSpringDependencyName();
	}
}
