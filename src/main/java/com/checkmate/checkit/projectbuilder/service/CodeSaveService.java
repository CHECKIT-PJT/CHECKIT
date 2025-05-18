package com.checkmate.checkit.projectbuilder.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.exception.CommonException;
import lombok.extern.slf4j.Slf4j;

/**
 * 생성된 Java 코드 파일을 실제 Spring 프로젝트 디렉터리에 저장하는 서비스
 */
@Slf4j
@Service
public class CodeSaveService {

	private static final String BASE_PATH = "/tmp/checkit/";

	/**
	 * 생성된 Java 파일들을 실제 디렉터리에 저장합니다.
	 * @param springName 프로젝트 이름 (압축 해제된 폴더명)
	 * @param basePackage ex: com.example
	 * @param javaFiles key = domain/controller/UserController.java, value = java 코드 문자열
	 */
	public void save(Integer projectId, String springName, String basePackage, Map<String, String> javaFiles) {
		String root =
			BASE_PATH + projectId.toString() + "/" + springName + "/src/main/java/" + basePackage.replace(".", "/")
				+ "/";

		for (Map.Entry<String, String> entry : javaFiles.entrySet()) {
			String relativePath = entry.getKey();  // 예: user/controller/UserController.java
			String code = entry.getValue();
			Path fullPath = Paths.get(root + relativePath);

			try {
				Files.createDirectories(fullPath.getParent());
				Files.writeString(fullPath, code);
				log.info("[Saved] Java file: {}", fullPath);
			} catch (IOException e) {
				log.error("[Error] Failed to save Java file: {}", fullPath, e);
				throw new CommonException(ErrorCode.SPRING_CODE_FILE_SAVE);
			}
		}
	}

	/**
	 * Docker Compose 파일을 저장합니다.
	 * @param projectId 프로젝트 ID
	 * @param springName 프로젝트 이름
	 * @param rootFile Docker Compose 파일 내용
	 */
	public void saveRootFile(int projectId, String springName, Map<String, String> rootFile) {
		String root = BASE_PATH + projectId + "/" + springName + "/";

		for (Map.Entry<String, String> entry : rootFile.entrySet()) {
			String relativePath = entry.getKey();  // 예: docker-compose.yml, readme.md
			String code = entry.getValue();
			Path fullPath = Paths.get(root + relativePath);

			try {
				Files.createDirectories(fullPath.getParent());
				Files.writeString(fullPath, code);
				log.info("[Saved] Root file: {}", fullPath);
			} catch (IOException e) {
				log.error("[Error] Failed to save Root file: {}", fullPath, e);
				throw new CommonException(ErrorCode.SPRING_CODE_FILE_SAVE);
			}
		}
	}

	public Path getProjectPath(int projectId) {
		String projectPath = BASE_PATH + projectId + "/";
		Path path = Paths.get(projectPath);
		if (Files.exists(path)) {
			return path;
		} else {
			throw new CommonException(ErrorCode.PROJECT_NOT_FOUND);
		}
	}
}
