# utils/token_utils.py
import tiktoken
from transformers import AutoTokenizer
from prompts.readme_templates import build_summary_prompt
from utils.token_config import get_token_policy

# ✅ 모델별 토크나이저 캐싱
_tokenizer_cache = {}

def get_tokenizer(llm_type: str):
    if llm_type not in _tokenizer_cache:
        model_config = get_token_policy(llm_type)
        tokenizer_id = model_config.get("tokenizer")
        if not tokenizer_id:
            raise ValueError(f"❌ '{llm_type}' 타입은 토크나이저가 필요하지 않습니다.")
        _tokenizer_cache[llm_type] = AutoTokenizer.from_pretrained(tokenizer_id)
    return _tokenizer_cache[llm_type]

def count_tokens(text: str, llm_type: str = "gemma") -> int:
    if llm_type == "gpt":
        # ✅ GPT 전용 정확한 토큰 계산기
        encoding = tiktoken.encoding_for_model("gpt-4")  # 또는 "gpt-3.5-turbo"
        return len(encoding.encode(text))
    tokenizer = get_tokenizer(llm_type)
    return len(tokenizer.encode(text, add_special_tokens=False))


def truncate_lines_to_fit_token_limit(
    lines: list[str],
    llm_type: str,
    max_total_tokens: int,
    reserved_completion_tokens: int,
    template_tokens: int
) -> tuple[str, int]:
    """
    기능 요약 문자열 리스트를 토큰 수 기준으로 자른 뒤,
    프롬프트 생성 + completion 토큰 여유까지 고려해 (prompt, max_tokens) 반환.
    """
    safety_margin = get_token_policy(llm_type)["safety"]

    result = []
    token_sum = 0

    for line in lines:
        line_tokens = count_tokens(line, llm_type)
        if token_sum + line_tokens + template_tokens + reserved_completion_tokens + safety_margin > max_total_tokens:
            break
        result.append(line)
        token_sum += line_tokens

    joined_text = "\n".join(result)
    prompt = build_summary_prompt(joined_text)
    prompt_token_len = count_tokens(prompt, llm_type)

    max_tokens = max_total_tokens - prompt_token_len - safety_margin

    if prompt_token_len + max_tokens + safety_margin > max_total_tokens:
        raise ValueError(
            f"❌ 최종 요청 토큰 수 초과: prompt={prompt_token_len}, completion={max_tokens}"
        )

    if max_tokens < reserved_completion_tokens:
        raise ValueError("❌ 요청 가능한 프롬프트가 없습니다. 내용이 너무 깁니다.")

    return prompt, max_tokens


def truncate_api_list_to_token_limit(
    api_list: list,
    llm_type: str,
    max_total_tokens: int = 1200
) -> list:
    """
    ApiSpec 리스트를 문자열로 환산했을 때 토큰 수가 max_total_tokens를 넘지 않도록 필터링.
    → 요약 프롬프트 생성 전에 사용.
    """
    token_sum = 0
    result = []

    for api in api_list:
        line = f"[{api.method}] {api.endpoint} - {api.description or ''}"
        line_tokens = count_tokens(line, llm_type)
        if token_sum + line_tokens > max_total_tokens:
            break
        result.append(api)
        token_sum += line_tokens

    return result
