# services/sequence_service.py

from sqlalchemy.orm import Session
from llm.invoke import get_llm_response
from prompts.sequence_diagram_templates import build_prompt_from_summary
from schemas.sequence_request import SequenceDiagramRequest
from schemas.sequence_response import SequenceDiagramResponse
from services.api_spec_summary_service import summarize_category_api_specs
from config.logger import logger
from services.extractor import extract_plantuml_block
from utils.plantuml import plantuml_encode, validate_plantuml_code
from utils.token_utils import count_tokens
from utils.constants import get_token_constants  # ✅ 추가

def generate_sequence_diagram_response(request: SequenceDiagramRequest, db: Session) -> SequenceDiagramResponse:
    try:
        # 1. API 요약 호출
        summary_text = summarize_category_api_specs(request, db)
        if not summary_text.strip():
            raise ValueError("요약 결과가 비어 있습니다.")
        logger.info("✅ 요약 결과")
        logger.debug(summary_text)

        # 2. 시퀀스 프롬프트 생성
        prompt = build_prompt_from_summary(summary_text)
        prompt_token_len = count_tokens(prompt, request.llm_type)

        # 3. 모델별 토큰 정책 가져오기
        token_config = get_token_constants(request.llm_type)
        max_tokens = (
            token_config["MAX_CONTEXT_TOKENS"]
            - prompt_token_len
            - token_config["SAFETY_MARGIN_TOKENS"]
        )

        # ✅ 안정성을 위한 추가 마진
        max_tokens = int(max_tokens * 0.95)

        if max_tokens < token_config["MIN_COMPLETION_TOKENS"]:
            raise ValueError("❌ 프롬프트가 너무 길어 시퀀스를 생성할 수 없습니다.")

        logger.info(f"🔢 시퀀스 프롬프트 토큰 수: {prompt_token_len}, max_tokens: {max_tokens}")

        # 4. LLM 호출
        llm_output = get_llm_response(prompt, request.llm_type, mode="sequence", max_tokens=max_tokens)
        logger.info("✅ LLM 시퀀스 생성 응답")
        logger.debug(llm_output)

        # 5. PlantUML 코드 추출 및 검증
        plantuml_code = extract_plantuml_block(llm_output)
        if not validate_plantuml_code(plantuml_code):
            logger.warning("⚠️ 생성된 시퀀스 코드가 유효하지 않음")
            return SequenceDiagramResponse(plantuml_code="", diagram_url=None)

        encoded = plantuml_encode(plantuml_code)
        diagram_url = f"https://www.plantuml.com/plantuml/png/{encoded}"

        logger.info("✅ 다이어그램 인코딩 완료")
        return SequenceDiagramResponse(plantuml_code=plantuml_code, diagram_url=diagram_url)

    except Exception as e:
        logger.error(f"[ERROR] 시퀀스 응답 생성 실패: {e}")
        return SequenceDiagramResponse(plantuml_code="", diagram_url=None)
