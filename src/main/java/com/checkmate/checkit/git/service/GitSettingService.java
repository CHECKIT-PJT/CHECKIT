package com.checkmate.checkit.git.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.checkmate.checkit.git.dto.request.BranchStrategyCreateRequest;
import com.checkmate.checkit.git.dto.request.BranchStrategyUpdateRequest;
import com.checkmate.checkit.git.dto.request.CommitConventionCreateRequest;
import com.checkmate.checkit.git.dto.request.CommitConventionUpdateRequest;
import com.checkmate.checkit.git.dto.request.GitIgnoreCreateRequest;
import com.checkmate.checkit.git.dto.response.BranchStrategyResponse;
import com.checkmate.checkit.git.dto.response.CommitConventionResponse;
import com.checkmate.checkit.git.dto.response.GitIgnoreResponse;
import com.checkmate.checkit.git.entity.GitSettingsEntity;
import com.checkmate.checkit.git.repository.GitSettingRepository;
import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.config.JwtTokenProvider;
import com.checkmate.checkit.global.exception.CommonException;
import com.checkmate.checkit.project.service.ProjectService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GitSettingService {

	private final GitSettingRepository gitSettingRepository;
	private final JwtTokenProvider jwtTokenProvider;
	private final ProjectService projectService;

	/**
	 * GitIgnore 생성
	 *
	 * @param token     JWT 토큰
	 * @param projectId 프로젝트 ID
	 * @param request   GitIgnore 생성 요청
	 */
	@Transactional
	public void createGitIgnore(String token, Integer projectId, GitIgnoreCreateRequest request) {

		Integer userId = jwtTokenProvider.getUserIdFromToken(token);

		// 로그인한 회원이 프로젝트에 참여하고 있는지 확인
		projectService.validateUserAndProject(userId, projectId);

		// GitSettingsEntity가 존재하는지 검증 및 생성
		GitSettingsEntity gitSettings = validateAndCreateGitSetting(projectId);

		// GitIgnore 생성
		gitSettings.createGitIgnore(request.content());
	}

	/**
	 * GitIgnore 조회
	 *
	 * @param token     JWT 토큰
	 * @param projectId 프로젝트 ID
	 * @return GitIgnoreResponse
	 */
	@Transactional(readOnly = true)
	public GitIgnoreResponse getGitIgnore(String token, Integer projectId) {

		Integer userId = jwtTokenProvider.getUserIdFromToken(token);

		// 로그인한 회원이 프로젝트에 참여하고 있는지 확인
		projectService.validateUserAndProject(userId, projectId);

		// GitSettingsEntity가 존재하는지 검증
		GitSettingsEntity gitSettings = validateGitSetting(projectId);

		// GitIgnore 조회
		if (gitSettings.getGitIgnore() == null) {
			throw new CommonException(ErrorCode.GIT_IGNORE_NOT_FOUND);
		}

		return new GitIgnoreResponse(gitSettings.getGitIgnore());
	}

	/**
	 * GitIgnore 수정
	 *
	 * @param token     JWT 토큰
	 * @param projectId 프로젝트 ID
	 * @param request   GitIgnore 수정 요청
	 */
	@Transactional
	public void updateGitIgnore(String token, Integer projectId, GitIgnoreCreateRequest request) {

		Integer userId = jwtTokenProvider.getUserIdFromToken(token);

		// 로그인한 회원이 프로젝트에 참여하고 있는지 확인
		projectService.validateUserAndProject(userId, projectId);

		// GitSettingsEntity가 존재하는지 검증
		GitSettingsEntity gitSettings = validateGitSetting(projectId);

		// GitIgnore 수정
		gitSettings.updateGitIgnore(request.content());
	}

	/**
	 * GitIgnore 삭제
	 *
	 * @param token     JWT 토큰
	 * @param projectId 프로젝트 ID
	 */
	@Transactional
	public void deleteGitIgnore(String token, Integer projectId) {
		Integer userId = jwtTokenProvider.getUserIdFromToken(token);

		// 로그인한 회원이 프로젝트에 참여하고 있는지 확인
		projectService.validateUserAndProject(userId, projectId);

		// GitSettingsEntity가 존재하는지 검증
		GitSettingsEntity gitSettings = validateGitSetting(projectId);

		// GitIgnore 삭제
		gitSettings.updateGitIgnore(null);
	}

	/**
	 * 브랜치 전략 생성
	 *
	 * @param token     JWT 토큰
	 * @param projectId 프로젝트 ID
	 * @param request   브랜치 전략 생성 요청
	 */
	@Transactional
	public void createBranchStrategy(String token, Integer projectId, BranchStrategyCreateRequest request) {
		Integer userId = jwtTokenProvider.getUserIdFromToken(token);

		// 로그인한 회원이 프로젝트에 참여하고 있는지 확인
		projectService.validateUserAndProject(userId, projectId);

		// GitSettingsEntity가 존재하는지 검증 및 생성
		GitSettingsEntity gitSettings = validateAndCreateGitSetting(projectId);

		// 브랜치 전략 생성
		gitSettings.createBranchConventionReg(request.branchConventionReg());
	}

	/**
	 * 브랜치 전략 조회
	 *
	 * @param token     JWT 토큰
	 * @param projectId 프로젝트 ID
	 * @return BranchStrategyResponse
	 */
	@Transactional(readOnly = true)
	public BranchStrategyResponse getBranchStrategy(String token, Integer projectId) {
		Integer userId = jwtTokenProvider.getUserIdFromToken(token);

		// 로그인한 회원이 프로젝트에 참여하고 있는지 확인
		projectService.validateUserAndProject(userId, projectId);

		// GitSettingsEntity가 존재하는지 검증
		GitSettingsEntity gitSettings = validateGitSetting(projectId);

		// 브랜치 전략 조회
		if (gitSettings.getBranchConventionReg() == null) {
			throw new CommonException(ErrorCode.BRANCH_STRATEGY_NOT_FOUND);
		}

		return new BranchStrategyResponse(gitSettings.getBranchConventionReg());
	}

	/**
	 * 브랜치 전략 수정
	 *
	 * @param token     JWT 토큰
	 * @param projectId 프로젝트 ID
	 * @param request   브랜치 전략 수정 요청
	 */
	@Transactional
	public void updateBranchStrategy(String token, Integer projectId, BranchStrategyUpdateRequest request) {
		Integer userId = jwtTokenProvider.getUserIdFromToken(token);

		// 로그인한 회원이 프로젝트에 참여하고 있는지 확인
		projectService.validateUserAndProject(userId, projectId);

		// GitSettingsEntity가 존재하는지 검증
		GitSettingsEntity gitSettings = validateGitSetting(projectId);

		// 브랜치 전략 수정
		gitSettings.updateBranchConventionReg(request.branchConventionReg());
	}

	/**
	 * 브랜치 전략 삭제
	 *
	 * @param token     JWT 토큰
	 * @param projectId 프로젝트 ID
	 */
	@Transactional
	public void deleteBranchStrategy(String token, Integer projectId) {
		Integer userId = jwtTokenProvider.getUserIdFromToken(token);

		// 로그인한 회원이 프로젝트에 참여하고 있는지 확인
		projectService.validateUserAndProject(userId, projectId);

		// GitSettingsEntity가 존재하는지 검증
		GitSettingsEntity gitSettings = validateGitSetting(projectId);

		// 브랜치 전략 삭제
		gitSettings.updateBranchConventionReg(null);
	}

	/**
	 * 커밋 규칙 생성
	 *
	 * @param token     JWT 토큰
	 * @param projectId 프로젝트 ID
	 * @param request   커밋 규칙 생성 요청
	 */
	@Transactional
	public void createCommitConvention(String token, Integer projectId, CommitConventionCreateRequest request) {
		Integer userId = jwtTokenProvider.getUserIdFromToken(token);

		// 로그인한 회원이 프로젝트에 참여하고 있는지 확인
		projectService.validateUserAndProject(userId, projectId);

		// GitSettingsEntity가 존재하는지 검증 및 생성
		GitSettingsEntity gitSettings = validateAndCreateGitSetting(projectId);

		// 커밋 규칙 생성
		gitSettings.createCommitConventionReg(request.commitConventionReg());
	}

	/**
	 * 커밋 규칙 조회
	 *
	 * @param token     JWT 토큰
	 * @param projectId 프로젝트 ID
	 * @return CommitConventionResponse
	 */
	@Transactional(readOnly = true)
	public CommitConventionResponse getCommitConvention(String token, Integer projectId) {
		Integer userId = jwtTokenProvider.getUserIdFromToken(token);

		// 로그인한 회원이 프로젝트에 참여하고 있는지 확인
		projectService.validateUserAndProject(userId, projectId);

		// GitSettingsEntity가 존재하는지 검증
		GitSettingsEntity gitSettings = validateGitSetting(projectId);

		// 커밋 규칙 조회
		if (gitSettings.getCommitConventionReg() == null) {
			throw new CommonException(ErrorCode.COMMIT_CONVENTION_NOT_FOUND);
		}

		return new CommitConventionResponse(gitSettings.getCommitConventionReg());
	}

	/**
	 * 커밋 규칙 수정
	 *
	 * @param token     JWT 토큰
	 * @param projectId 프로젝트 ID
	 * @param request   커밋 규칙 수정 요청
	 */
	@Transactional
	public void updateCommitConvention(String token, Integer projectId, CommitConventionUpdateRequest request) {
		Integer userId = jwtTokenProvider.getUserIdFromToken(token);

		// 로그인한 회원이 프로젝트에 참여하고 있는지 확인
		projectService.validateUserAndProject(userId, projectId);

		// GitSettingsEntity가 존재하는지 검증
		GitSettingsEntity gitSettings = validateGitSetting(projectId);

		// 커밋 규칙 수정
		gitSettings.updateCommitConventionReg(request.commitConventionReg());
	}

	/**
	 * 커밋 규칙 삭제
	 *
	 * @param token     JWT 토큰
	 * @param projectId 프로젝트 ID
	 */
	@Transactional
	public void deleteCommitConvention(String token, Integer projectId) {
		Integer userId = jwtTokenProvider.getUserIdFromToken(token);

		// 로그인한 회원이 프로젝트에 참여하고 있는지 확인
		projectService.validateUserAndProject(userId, projectId);

		// GitSettingsEntity가 존재하는지 검증
		GitSettingsEntity gitSettings = validateGitSetting(projectId);

		// 커밋 규칙 삭제
		gitSettings.updateCommitConventionReg(null);
	}

	/**
	 * GitSettingsEntity가 존재하는지 검증
	 *
	 * @param projectId 프로젝트 ID
	 * @return GitSettingsEntity
	 */
	private GitSettingsEntity validateGitSetting(Integer projectId) {
		return gitSettingRepository.findByProjectId(projectId)
			.orElseThrow(() -> new CommonException(ErrorCode.GIT_SETTING_NOT_FOUND));
	}

	/**
	 * GitSettingsEntity가 존재하는지 검증하고, 없으면 생성
	 *
	 * @param projectId 프로젝트 ID
	 * @return GitSettingsEntity
	 */
	private GitSettingsEntity validateAndCreateGitSetting(Integer projectId) {

		return gitSettingRepository.findByProjectId(projectId).orElseGet(() -> {
			GitSettingsEntity gitSettings = GitSettingsEntity.builder().projectId(projectId).build();
			return gitSettingRepository.save(gitSettings);
		});
	}
}
