# llm/base.py

from abc import ABC, abstractmethod
from utils.token_config import get_token_policy
from utils.token_utils import count_tokens

class LLMBase(ABC):
    def __init__(self, llm_type: str, model_name: str):
        self.llm_type = llm_type
        self.model_name = model_name
        self.policy = get_token_policy(llm_type)

    def _calculate_max_tokens(self, prompt: str, user_max_tokens: int = None) -> int:
        prompt_len = count_tokens(prompt, self.llm_type)
        if user_max_tokens is not None:
            return user_max_tokens

        max_tokens = self.policy["context"] - prompt_len - self.policy["safety"]
        if max_tokens < self.policy["min_completion"]:
            raise ValueError(
                f"❌ 프롬프트가 너무 깁니다: prompt_len={prompt_len}, usable={max_tokens}, context={self.policy['context']}"
            )
        return max_tokens

    @abstractmethod
    def generate(self, prompt: str, mode: str = "default", max_tokens: int = None, stream: bool = False) -> str:
        pass
