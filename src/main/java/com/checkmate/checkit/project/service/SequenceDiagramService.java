package com.checkmate.checkit.project.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.config.JwtTokenProvider;
import com.checkmate.checkit.global.exception.CommonException;
import com.checkmate.checkit.project.dto.request.SequenceDiagramUpdateRequest;
import com.checkmate.checkit.project.dto.response.SequenceDiagramResponse;
import com.checkmate.checkit.project.repository.SequenceDiagramRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SequenceDiagramService {

	private final SequenceDiagramRepository sequenceDiagramRepository;
	private final ProjectService projectService;
	private final JwtTokenProvider jwtTokenProvider;

	/**
	 * 시퀀스 다이어그램을 조회
	 * @param token     JWT 토큰
	 * @param projectId 프로젝트 ID
	 * @return 시퀀스 다이어그램 응답 객체
	 */
	@Transactional(readOnly = true)
	public SequenceDiagramResponse getSequenceDiagram(String token, Integer projectId) {

		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// 현재 로그인한 사용자가 프로젝트 소속인지 확인
		projectService.validateUserAndProject(loginUserId, projectId);

		// 시퀀스 다이어그램 조회
		return sequenceDiagramRepository.findByProjectIdAndPlantUmlCodeIsNotNull(projectId)
			.map(sequenceDiagram -> new SequenceDiagramResponse(sequenceDiagram.getPlantUmlCode()))
			.orElseThrow(() -> new CommonException(ErrorCode.SEQUENCE_DIAGRAM_NOT_FOUND));
	}

	/**
	 * 시퀀스 다이어그램을 업데이트
	 * @param token     JWT 토큰
	 * @param projectId 프로젝트 ID
	 * @param sequenceDiagramUpdateRequest 시퀀스 다이어그램 업데이트 요청 객체
	 */
	@Transactional
	public void updateSequenceDiagram(String token, Integer projectId,
		SequenceDiagramUpdateRequest sequenceDiagramUpdateRequest) {
		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);

		// 현재 로그인한 사용자가 프로젝트 소속인지 확인
		projectService.validateUserAndProject(loginUserId, projectId);

		// 시퀀스 다이어그램 업데이트
		sequenceDiagramRepository.findByProjectIdAndPlantUmlCodeIsNotNull(projectId).ifPresentOrElse(
			sequenceDiagram -> {
				sequenceDiagram.updatePlantUmlCode(sequenceDiagramUpdateRequest.content()
				);
			}, () -> {
				throw new CommonException(ErrorCode.SEQUENCE_DIAGRAM_NOT_FOUND);
			}
		);
	}
}
