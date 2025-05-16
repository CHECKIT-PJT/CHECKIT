package com.checkmate.checkit.sequencediagram;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.common.infra.ai.AiClientService;
import com.checkmate.checkit.global.config.JwtTokenProvider;
import com.checkmate.checkit.global.config.properties.AiProperties;
import com.checkmate.checkit.global.exception.CommonException;
import com.checkmate.checkit.project.service.ProjectService;
import com.checkmate.checkit.sequencediagram.dto.GenerateSequenceDiagramRequest;
import com.checkmate.checkit.sequencediagram.dto.SequenceDiagramCreateRequest;
import com.checkmate.checkit.sequencediagram.dto.SequenceDiagramResponse;
import com.checkmate.checkit.sequencediagram.dto.SequenceDiagramUpdateRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SequenceDiagramService {

	private final SequenceDiagramRepository sequenceDiagramRepository;
	private final ProjectService projectService;
	private final JwtTokenProvider jwtTokenProvider;
	private final AiClientService aiClientService;
	private final AiProperties aiProperties;

	/**
	 * 시퀀스 다이어그램 생성 (저장하지 않음)
	 *
	 * @param token JWT 인증 토큰
	 * @param projectId 프로젝트 ID
	 * @return 생성된 시퀀스 다이어그램 응답
	 */
	public SequenceDiagramResponse generateSequenceDiagram(String token, Integer projectId, String category) {
		Integer userId = jwtTokenProvider.getUserIdFromToken(token);
		projectService.validateUserAndProject(userId, projectId);

		String llmType = aiProperties.getLlm().getType();
		GenerateSequenceDiagramRequest request = new GenerateSequenceDiagramRequest(projectId, llmType, category);
		SequenceDiagramResponse response = aiClientService.requestSequenceDiagram(request).block();
		return response;
	}

	/**
	 * 시퀀스 다이어그램 저장 (중복 방지)
	 *
	 * @param token JWT 인증 토큰
	 * @param projectId 프로젝트 ID
	 * @param sequenceDiagramCreateRequest 시퀀스 다이어그램요청 DTO
	 */
	@Transactional
	public void saveSequenceDiagram(String token, Integer projectId,
		SequenceDiagramCreateRequest sequenceDiagramCreateRequest) {
		Integer userId = jwtTokenProvider.getUserIdFromToken(token);
		projectService.validateUserAndProject(userId, projectId);

		boolean exists = sequenceDiagramRepository.existsByProjectIdAndPlantUmlCodeIsNotNull(projectId);
		if (exists) {
			throw new CommonException(ErrorCode.SEQUENCE_DIAGRAM_ALREADY_EXISTS);
		}

		SequenceDiagramEntity newEntity = SequenceDiagramEntity.builder()
			.projectId(projectId)
			.plantUmlCode(sequenceDiagramCreateRequest.content())
			.imageUrl(sequenceDiagramCreateRequest.diagramUrl())
			.category(sequenceDiagramCreateRequest.category())
			.build();

		sequenceDiagramRepository.save(newEntity);
	}

	/**
	 * 시퀀스 다이어그램 조회
	 *
	 * @param token JWT 인증 토큰
	 * @param projectId 프로젝트 ID
	 * @return 시퀀스 다이어그램 응답 객체
	 */
	@Transactional(readOnly = true)
	public SequenceDiagramResponse getSequenceDiagram(String token, Integer projectId, String category) {
		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);
		projectService.validateUserAndProject(loginUserId, projectId);

		return sequenceDiagramRepository.findByProjectIdAndPlantUmlCodeIsNotNullAndCategory(projectId, category)
			.map(sequenceDiagram -> new SequenceDiagramResponse(sequenceDiagram.getPlantUmlCode(),
				sequenceDiagram.getImageUrl(), sequenceDiagram.getCategory()))
			.orElseThrow(() -> new CommonException(ErrorCode.SEQUENCE_DIAGRAM_NOT_FOUND));
	}

	/**
	 * 시퀀스 다이어그램 수정
	 *
	 * @param token JWT 인증 토큰
	 * @param projectId 프로젝트 ID
	 * @param sequenceDiagramUpdateRequest 시퀀스 다이어그램 요청 DTO
	 */
	@Transactional
	public void updateSequenceDiagram(String token, Integer projectId,
		SequenceDiagramUpdateRequest sequenceDiagramUpdateRequest) {
		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);
		projectService.validateUserAndProject(loginUserId, projectId);

		sequenceDiagramRepository.findByProjectIdAndPlantUmlCodeIsNotNullAndCategory(projectId,
			sequenceDiagramUpdateRequest.category()).ifPresentOrElse(
			sequenceDiagram -> {
				sequenceDiagram.updatePlantUmlCode(sequenceDiagramUpdateRequest.content(),
					sequenceDiagramUpdateRequest.diagramUrl(),
					sequenceDiagramUpdateRequest.category());
			},
			() -> {
				throw new CommonException(ErrorCode.SEQUENCE_DIAGRAM_NOT_FOUND);
			}
		);
	}

	/**
	 * 시퀀스 다이어그램 삭제
	 *
	 * @param token JWT 인증 토큰
	 * @param projectId 프로젝트 ID
	 */
	@Transactional
	public void deleteSequenceDiagram(String token, Integer projectId, String category) {
		Integer loginUserId = jwtTokenProvider.getUserIdFromToken(token);
		projectService.validateUserAndProject(loginUserId, projectId);

		sequenceDiagramRepository.findByProjectIdAndPlantUmlCodeIsNotNullAndCategory(projectId, category)
			.ifPresentOrElse(
				sequenceDiagram -> {
					sequenceDiagram.deletePlantUmlCode();
				},
				() -> {
					throw new CommonException(ErrorCode.SEQUENCE_DIAGRAM_NOT_FOUND);
				}
			);
	}
}
