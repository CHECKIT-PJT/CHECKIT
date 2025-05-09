package com.checkmate.checkit.project.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.config.JwtTokenProvider;
import com.checkmate.checkit.global.exception.CommonException;
import com.checkmate.checkit.project.dto.request.ReadmeUpdateRequest;
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
		return readmeRepository.findByProjectIdAndIsDeletedFalse(projectId)
			.map(readme -> new ReadmeResponse(readme.getReadmeContent()))
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
		readmeRepository.findByProjectIdAndIsDeletedFalse(projectId).ifPresentOrElse(readme -> {
			readme.delete();
		}, () -> {
			throw new CommonException(ErrorCode.README_NOT_FOUND);
		});
	}
}
