package com.checkmate.checkit.project.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.config.JwtTokenProvider;
import com.checkmate.checkit.global.exception.CommonException;
import com.checkmate.checkit.project.dto.response.ReadmeResponse;
import com.checkmate.checkit.project.repository.ReadmeRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReadmeService {

	private final ReadmeRepository readmeRepository;
	private final ProjectService projectService;
	private final JwtTokenProvider jwtTokenProvider;

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
		return readmeRepository.findByProjectId(projectId)
			.map(readme -> new ReadmeResponse(readme.getReadmeContent()))
			.orElseThrow(() -> new CommonException(ErrorCode.README_NOT_FOUND));
	}
}
