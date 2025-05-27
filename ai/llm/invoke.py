# llm/invoke.py

import time
from llm.factory import get_llm
from config.logger import logger
from utils.token_utils import count_tokens  # 🔹 추가

def get_llm_response(prompt: str, model_type: str, mode: str = "default", max_tokens: int = None, stream: bool = False) -> str:
    logger.info(f"LLM 호출 시작 [모델: {model_type}, 모드: {mode}, max_tokens: {max_tokens}]")
    start = time.time()
    try:
        prompt_token_len = count_tokens(prompt)  # 🔹 프롬프트 길이 측정
        logger.info(f"🔢 프롬프트 토큰 수: {prompt_token_len}, 예상 응답 토큰: {max_tokens}, 총 요청 토큰: {prompt_token_len + (max_tokens or 0)}")

        llm = get_llm(model_type)
        response = llm.generate(prompt, mode=mode, max_tokens=max_tokens, stream=stream)

        logger.info(f"LLM 프롬프트:\n{prompt}")
        logger.info(f"LLM 응답 본문:\n{response}")
        logger.info(f"LLM 응답 완료 ⏱{time.time() - start:.2f}s")
        return response
    except Exception as e:
        logger.exception("LLM 호출 중 오류 발생")
        raise
