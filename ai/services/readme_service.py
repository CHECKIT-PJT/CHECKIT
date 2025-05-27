# services/readme_service.py

from sqlalchemy.orm import Session
from config.logger import logger
from services.function_spec_summary_service import get_summarized_function_specs
from prompts.readme_templates import build_prompt_from_functional_specs
from llm.invoke import get_llm_response
from utils.token_utils import count_tokens
from utils.constants import get_token_constants  # ✅ 변경된 import


def generate_full_readme(project_id: int, db: Session, llm_type: str) -> str:
    summary = get_summarized_function_specs(project_id, db, llm_type)
    summary_token_len = count_tokens(summary, llm_type)

    logger.info(f"[README] 요약 길이: {summary_token_len} tokens")

    prompt = build_prompt_from_functional_specs(summary)
    prompt_token_len = count_tokens(prompt, llm_type)

    token_config = get_token_constants(llm_type)
    max_tokens = token_config["MAX_CONTEXT_TOKENS"] - prompt_token_len - token_config["SAFETY_MARGIN_TOKENS"]

    if max_tokens < token_config["MIN_COMPLETION_TOKENS"]:
        raise ValueError(
            f"README.md 생성을 위한 충분한 토큰 여유가 없습니다. "
            f"(요약 {summary_token_len} tokens, 전체 프롬프트 {prompt_token_len} tokens)"
        )

    # ✅ 실무 안전 조치: 한글 등 고려하여 5~10% 여유 두기
    max_tokens = int(max_tokens * 0.95)

    return get_llm_response(prompt, model_type=llm_type, mode="readme", max_tokens=max_tokens)
