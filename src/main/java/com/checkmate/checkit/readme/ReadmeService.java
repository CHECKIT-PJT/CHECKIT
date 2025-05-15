package com.checkmate.checkit.readme;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.common.infra.ai.AiClientService;
import com.checkmate.checkit.global.config.JwtTokenProvider;
import com.checkmate.checkit.global.config.properties.AiProperties;
import com.checkmate.checkit.global.exception.CommonException;
import com.checkmate.checkit.readme.dto.GenerateReadmeRequest;
import com.checkmate.checkit.readme.dto.ReadmeUpdateRequest;
import com.checkmate.checkit.readme.dto.ReadmeResponse;
import com.checkmate.checkit.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReadmeService {

	private final ReadmeRepository readmeRepository;
	private final ProjectService projectService;
	private final JwtTokenProvider jwtTokenProvider;
	private final AiClientService aiClientService;
	private final AiProperties aiProperties;

	/**
	 * README 생성 (저장 X)
	 *
	 * @param token 사용자 JWT 토큰
	 * @param projectId 프로젝트 ID
	 * @return 생성된 README 결과 응답 DTO
	 */
	public ReadmeResponse generateReadme(String token, Integer projectId) {
		Integer userId = jwtTokenProvider.getUserIdFromToken(token);
		projectService.validateUserAndProject(userId, projectId);

		String llmType = aiProperties.getLlm().getType();
		log.info("📤 README 생성 요청 - projectId={}, llmType={}", projectId, llmType);

		GenerateReadmeRequest request = new GenerateReadmeRequest(projectId, llmType);
		ReadmeResponse response = aiClientService.requestReadme(request).block();

		log.info("📥 README 생성 완료 - 길이={} chars", response.getReadme().length());
		return response;
	}


	/**
	 * README 저장 (신규 or 업데이트)
	 *
	 * @param token 사용자 JWT 토큰
	 * @param projectId 프로젝트 ID
	 * @param content 저장할 README 내용
	 */
	@Transactional
	public void saveReadme(String token, Integer projectId, String content) {
		Integer userId = jwtTokenProvider.getUserIdFromToken(token);
		projectService.validateUserAndProject(userId, projectId);

		boolean exists = readmeRepository.existsByProjectIdAndIsDeletedFalse(projectId);
		if (exists) {
			throw new CommonException(ErrorCode.README_ALREADY_EXISTS);
		}

		readmeRepository.findByProjectIdAndIsDeletedFalse(projectId)
			.ifPresentOrElse(
				readme -> readme.updateReadmeContent(content),
				() -> readmeRepository.save(
					ReadmeEntity.builder()
						.projectId(projectId)
						.readmeContent(content)
						.build()
				)
			);
	}

	/**
	 * README 파일 조회
	 * @param token : JWT 토큰
	 * @param projectId : 프로젝트 ID
	 * @return readmeResponse : README 응답 DTO
	 */
	@Transactional(readOnly = true)
	public ReadmeResponse getReadme(String token, Integer projectId) {
		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// 현재 로그인한 사용자가 프로젝트 소속인지 확인
		projectService.validateUserAndProject(loginUserId, projectId);

		// README 파일 조회
		return readmeRepository.findByProjectIdAndIsDeletedFalse(projectId)
			.map(readme -> new ReadmeResponse(true, readme.getReadmeContent(), "데이터"))
			.orElseThrow(() -> new CommonException(ErrorCode.README_NOT_FOUND));
	}

	/**
	 * README 파일 업데이트
	 * @param token : JWT 토큰
	 * @param projectId : 프로젝트 ID
	 * @param readmeUpdateRequest : README 업데이트 요청 DTO
	 */
	@Transactional
	public void updateReadme(String token, Integer projectId, ReadmeUpdateRequest readmeUpdateRequest) {
		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// 현재 로그인한 사용자가 프로젝트 소속인지 확인
		projectService.validateUserAndProject(loginUserId, projectId);

		// README 파일 업데이트
		readmeRepository.findByProjectIdAndIsDeletedFalse(projectId).ifPresentOrElse(readme -> {
			readme.updateReadmeContent(readmeUpdateRequest.content());
		}, () -> {
			throw new CommonException(ErrorCode.README_NOT_FOUND);
		});
	}

	/**
	 * README 파일 삭제
	 * @param token : JWT 토큰
	 * @param projectId : 프로젝트 ID
	 */
	@Transactional
	public void deleteReadme(String token, Integer projectId) {
		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// 현재 로그인한 사용자가 프로젝트 소속인지 확인
		projectService.validateUserAndProject(loginUserId, projectId);

		// README 파일 삭제
		readmeRepository.findByProjectIdAndIsDeletedFalse(projectId)
			.ifPresentOrElse(
				ReadmeEntity::delete,
				() -> { throw new CommonException(ErrorCode.README_NOT_FOUND); }
			);
	}

	/**
	 * 로그 출력 시 민감한 토큰 정보를 일부 마스킹합니다.
	 *
	 * @param token JWT 토큰 문자열
	 * @return 마스킹된 문자열 (예: abcde...vwxyz)
	 */
	private String maskToken(String token) {
		if (token == null || token.length() < 10) return "****";
		return token.substring(0, 5) + "..." + token.substring(token.length() - 5);
	}
}
