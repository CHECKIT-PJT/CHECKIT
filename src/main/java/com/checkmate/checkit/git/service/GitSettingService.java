package com.checkmate.checkit.git.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.checkmate.checkit.git.dto.request.GitIgnoreCreateRequest;
import com.checkmate.checkit.git.entity.GitSettingsEntity;
import com.checkmate.checkit.git.repository.GitSettingRepository;
import com.checkmate.checkit.global.config.JwtTokenProvider;
import com.checkmate.checkit.project.service.ProjectService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GitSettingService {

	private final GitSettingRepository gitSettingRepository;
	private final JwtTokenProvider jwtTokenProvider;
	private final ProjectService projectService;

	@Transactional
	public void createGitIgnore(String token, Integer projectId, GitIgnoreCreateRequest request) {

		Integer userId = jwtTokenProvider.getUserIdFromToken(token);

		// 로그인한 회원이 프로젝트에 참여하고 있는지 확인
		projectService.validateUserAndProject(userId, projectId);

		// GitSettingsEntity가 존재하는지 검증 및 생성
		GitSettingsEntity gitSettings = validateGitSetting(projectId);

		// GitIgnore 생성
		gitSettings.createGitIgnore(request.content());
	}

	/**
	 * GitSettingsEntity가 존재하는지 검증하고, 없으면 생성
	 *
	 * @param projectId 프로젝트 ID
	 * @return GitSettingsEntity
	 */
	private GitSettingsEntity validateGitSetting(Integer projectId) {

		return gitSettingRepository.findByProjectId(projectId)
			.orElseGet(() -> {
				GitSettingsEntity gitSettings = GitSettingsEntity.builder()
					.projectId(projectId)
					.build();
				return gitSettingRepository.save(gitSettings);
			});
	}

}
