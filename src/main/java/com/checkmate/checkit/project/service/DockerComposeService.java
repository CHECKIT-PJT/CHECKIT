package com.checkmate.checkit.project.service;

import org.springframework.stereotype.Service;

import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.exception.CommonException;
import com.checkmate.checkit.project.common.DatabaseType;
import com.checkmate.checkit.project.dto.request.DockerComposeCreateRequest;
import com.checkmate.checkit.project.dto.request.DockerComposeUpdateRequest;
import com.checkmate.checkit.project.dto.response.DockerComposeResponse;
import com.checkmate.checkit.project.entity.DockerComposeEntity;
import com.checkmate.checkit.project.repository.DockerComposeRepository;
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
