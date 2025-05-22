package com.checkmate.checkit.project.service;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;

import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.exception.CommonException;
import com.checkmate.checkit.project.common.DatabaseType;
import com.checkmate.checkit.project.dto.request.DockerComposeCreateRequest;
import com.checkmate.checkit.project.dto.request.DockerComposeUpdateRequest;
import com.checkmate.checkit.project.dto.response.DockerComposeResponse;
import com.checkmate.checkit.project.entity.DockerComposeEntity;
import com.checkmate.checkit.project.repository.DockerComposeRepository;
import com.checkmate.checkit.springsettings.entity.DependencyEntity;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DockerComposeService {

	private final DockerComposeRepository dockerComposeRepository;

	/**
	 * 도커 컴포즈 파일을 생성하고 저장
	 * @param projectId : 프로젝트 ID
	 * @param dockerComposeCreateRequest : Docker Compose 생성 요청
	 */
	public void generateAndSaveDockerComposeFile(Integer projectId,
		DockerComposeCreateRequest dockerComposeCreateRequest) {

		StringBuilder dockerComposeContent = new StringBuilder();

		dockerComposeContent.append("services:\n");

		for (DatabaseType databaseType : dockerComposeCreateRequest.databases()) {
			switch (databaseType) {
				case MYSQL -> dockerComposeContent.append(generateMySQLContent());
				case POSTGRESQL -> dockerComposeContent.append(generatePostgreSQLContent());
				case MONGODB -> dockerComposeContent.append(generateMongoDBContent());
				case REDIS -> dockerComposeContent.append(generateRedisContent());
			}
		}

		dockerComposeContent.append("\nvolumes:\n");

		if (dockerComposeCreateRequest.databases().contains(DatabaseType.MYSQL)) {
			dockerComposeContent.append("  mysql-data:\n");
		}
		if (dockerComposeCreateRequest.databases().contains(DatabaseType.POSTGRESQL)) {
			dockerComposeContent.append("  pgdata:\n");
		}
		if (dockerComposeCreateRequest.databases().contains(DatabaseType.MONGODB)) {
			dockerComposeContent.append("  mongo-data:\n");
		}

		DockerComposeEntity dockerComposeEntity = DockerComposeEntity.builder()
			.projectId(projectId)
			.content(dockerComposeContent.toString())
			.build();

		dockerComposeRepository.save(dockerComposeEntity);
	}

	/**
	 * 도커 컴포즈 파일을 조회
	 * @param projectId : 프로젝트 ID
	 * @return : Docker Compose 응답
	 */
	public DockerComposeResponse getDockerComposeFile(Integer projectId) {
		DockerComposeEntity dockerComposeEntity = dockerComposeRepository.findByProjectId(projectId)
			.orElseThrow(
				() -> new CommonException(ErrorCode.DOCKER_COMPOSE_NOT_FOUND));

		return new DockerComposeResponse(dockerComposeEntity.getContent());
	}

	/**
	 * 도커 컴포즈 파일을 수정
	 * @param projectId : 프로젝트 ID
	 * @param dockerComposeUpdateRequest : Docker Compose 수정 요청
	 */
	public void updateDockerComposeFile(Integer projectId, DockerComposeUpdateRequest dockerComposeUpdateRequest) {
		DockerComposeEntity dockerComposeEntity = dockerComposeRepository.findByProjectId(projectId)
			.orElseThrow(
				() -> new CommonException(ErrorCode.DOCKER_COMPOSE_NOT_FOUND));

		dockerComposeEntity.updateContent(dockerComposeUpdateRequest.content());
	}

	/**
	 * 도커 컴포즈 파일을 삭제
	 * @param projectId : 프로젝트 ID
	 */
	public void deleteDockerComposeFile(Integer projectId) {
		DockerComposeEntity dockerComposeEntity = dockerComposeRepository.findByProjectId(projectId)
			.orElseThrow(
				() -> new CommonException(ErrorCode.DOCKER_COMPOSE_NOT_FOUND));

		dockerComposeRepository.delete(dockerComposeEntity);
	}

	/**
	 * 도커 컴포즈 파일을 다운로드
	 * @param projectId : 프로젝트 ID
	 * @return : ByteArrayResource
	 */
	public ByteArrayResource createDockerComposeFile(Integer projectId) {
		DockerComposeEntity dockerComposeEntity = dockerComposeRepository.findByProjectId(projectId)
			.orElseThrow(
				() -> new CommonException(ErrorCode.DOCKER_COMPOSE_NOT_FOUND));

		String content = dockerComposeEntity.getContent();

		return new ByteArrayResource(content.getBytes(StandardCharsets.UTF_8));
	}

	/**
	 * 의존성 목록을 기반으로 도커 컴포즈 파일을 생성하고 저장
	 * @param projectId : 프로젝트 ID
	 * @param dependencies : 의존성 목록
	 * @return : 생성된 도커 컴포즈 파일 경로
	 */
	public Map<String, String> generateDockerComposeByDependenciesAndSave(int projectId,
		List<DependencyEntity> dependencies) {
		StringBuilder dockerComposeContent = new StringBuilder();
		dockerComposeContent.append("services:\n");

		boolean hasMySQL = false;
		boolean hasPostgreSQL = false;
		boolean hasMongoDB = false;

		for (DependencyEntity dependency : dependencies) {
			String name = dependency.getDependencyName();
			DatabaseType dbType = getDatabaseTypeFromDependency(name);

			if (dbType == null)
				continue;

			switch (dbType) {
				case MYSQL -> {
					dockerComposeContent.append(generateMySQLContent());
					hasMySQL = true;
				}
				case POSTGRESQL -> {
					dockerComposeContent.append(generatePostgreSQLContent());
					hasPostgreSQL = true;
				}
				case MONGODB -> {
					dockerComposeContent.append(generateMongoDBContent());
					hasMongoDB = true;
				}
				case REDIS -> dockerComposeContent.append(generateRedisContent());
			}
		}

		// 볼륨 추가
		dockerComposeContent.append("\nvolumes:\n");
		if (hasMySQL) {
			dockerComposeContent.append("  mysql-data:\n");
		}
		if (hasPostgreSQL) {
			dockerComposeContent.append("  pgdata:\n");
		}
		if (hasMongoDB) {
			dockerComposeContent.append("  mongo-data:\n");
		}

		DockerComposeEntity dockerComposeEntity = dockerComposeRepository.findByProjectId(projectId)
			.map(entity -> {
				entity.updateContent(dockerComposeContent.toString());
				return entity;
			})
			.orElse(DockerComposeEntity.builder()
				.projectId(projectId)
				.content(dockerComposeContent.toString())
				.build());

		dockerComposeRepository.save(dockerComposeEntity);

		// 결과 반환
		Map<String, String> result = new HashMap<>();
		result.put("docker-compose.yml", dockerComposeContent.toString());
		return result;
	}

	/**
	 * 도커 컴포즈 파일을 조회
	 * @param projectId : 프로젝트 ID
	 * @return : 도커 컴포즈 파일 경로
	 */
	public Map<String, String> getDockerComposeFileWithPath(int projectId) {
		DockerComposeEntity dockerComposeEntity = dockerComposeRepository.findByProjectId(projectId)
			.orElseThrow(
				() -> new CommonException(ErrorCode.DOCKER_COMPOSE_NOT_FOUND));

		Map<String, String> result = new HashMap<>();
		result.put("docker-compose.yml", dockerComposeEntity.getContent());
		return result;
	}

	private DatabaseType getDatabaseTypeFromDependency(String name) {
		if (name.contains("MySQL")) {
			return DatabaseType.MYSQL;
		}
		if (name.contains("PostgreSQL")) {
			return DatabaseType.POSTGRESQL;
		}
		if (name.contains("MongoDB")) {
			return DatabaseType.MONGODB;
		}
		if (name.contains("Redis")) {
			return DatabaseType.REDIS;
		}
		return null; // DB 관련이 아닌 경우
	}

	private String generateMySQLContent() {
		return """
			  mysql:
			    image: mysql:latest
			    container_name: mysql
			    environment:
			      MYSQL_DATABASE: ${MYSQL_DATABASE}
			      MYSQL_USER: ${MYSQL_USER}
			      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
			      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
			    ports:
			      - "3307:3306"
			    volumes:
			      - mysql-data:/var/lib/mysql
			""";
	}

	private String generatePostgreSQLContent() {
		return """
			  postgresql:
			    image: postgres:latest
			    container_name: postgres
			    environment:
			      POSTGRES_DB: ${POSTGRES_DB}
			      POSTGRES_USER: ${POSTGRES_USER}
			      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
			    ports:
			      - "5433:5432"
			    volumes:
			      - pgdata:/var/lib/postgresql/data
			""";
	}

	private String generateMongoDBContent() {
		return """
			  mongodb:
			    image: mongo:latest
			    container_name: mongodb
			    environment:
			      MONGO_INITDB_DATABASE: ${MONGO_INITDB_DATABASE}
			      MONGO_INITDB_ROOT_USERNAME: ${MONGO_INITDB_ROOT_USERNAME}
			      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_INITDB_ROOT_PASSWORD}
			    ports:
			      - "27017:27017"
			    volumes:
			      - mongo-data:/data/db
			""";
	}

	private String generateRedisContent() {
		return """
			  redis:
			    image: redis:latest
			    container_name: redis
			    ports:
			      - "6379:6379"
			""";
	}
}
