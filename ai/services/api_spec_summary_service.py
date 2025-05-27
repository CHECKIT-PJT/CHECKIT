# services/api_spec_summary_service.py

from config.logger import logger
from prompts.sequence_diagram_templates import build_api_summary_prompt
from llm.invoke import get_llm_response
from sqlalchemy.orm import Session
from models.api_spec import ApiSpec
from schemas.sequence_request import SequenceDiagramRequest
from utils.token_utils import count_tokens
from utils.constants import get_token_constants


def summarize_category_api_specs(request: SequenceDiagramRequest, db: Session) -> str:
    """
    카테고리별 API 명세를 DB에서 조회 후,
    토큰 길이 기준으로 필터링하고 요약을 생성합니다.
    """
    token_config = get_token_constants(request.llm_type)

    # ✅ 여유 있게 조회 (넉넉히)
    candidate_specs = db.query(
        ApiSpec.method,
        ApiSpec.endpoint,
        ApiSpec.description
    ).filter(
        ApiSpec.project_id == request.project_id,
        ApiSpec.category == request.category,
        ApiSpec.is_deleted == 0
    ).order_by(ApiSpec.created_at.desc()).limit(30).all()

    # ✅ 템플릿 기준 토큰 계산
    base_prompt = build_api_summary_prompt([])
    base_prompt_tokens = count_tokens(base_prompt, request.llm_type)

    max_data_tokens = (
        token_config["MAX_CONTEXT_TOKENS"]
        - token_config["SAFETY_MARGIN_TOKENS"]
        - token_config["MIN_COMPLETION_TOKENS"]
        - base_prompt_tokens
    )

    logger.info(f"📏 사용 가능한 토큰 여유: {max_data_tokens} (프롬프트 제외)")

    # ✅ 토큰 기준으로 누적하면서 자르기
    filtered = []
    token_sum = 0
    for spec in candidate_specs:
        line = f"[{spec.method}] {spec.endpoint} - {spec.description or ''}"
        line_tokens = count_tokens(line, request.llm_type)
        if token_sum + line_tokens > max_data_tokens:
            break
        filtered.append(spec)
        token_sum += line_tokens

    if not filtered:
        raise ValueError("❌ 요약 가능한 API 명세가 없습니다. 내용이 너무 깁니다.")

    prompt = build_api_summary_prompt(filtered)
    prompt_token_len = count_tokens(prompt, request.llm_type)
    max_tokens = token_config["MAX_CONTEXT_TOKENS"] - prompt_token_len - token_config["SAFETY_MARGIN_TOKENS"]

    if max_tokens < token_config["MIN_COMPLETION_TOKENS"]:
        raise ValueError("❌ 프롬프트가 너무 길어 요약을 생성할 수 없습니다.")

    logger.info(f"🧾 최종 프롬프트 길이: {prompt_token_len} tokens, max_tokens: {max_tokens}")
    return get_llm_response(prompt, request.llm_type, mode="summary", max_tokens=max_tokens)
