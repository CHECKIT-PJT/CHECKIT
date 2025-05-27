# llm/gpt.py

import openai
from config.model_map import LLM_MODEL_NAME_MAP
from config.settings import settings
from llm.base import LLMBase
from config.logger import logger

class GPTLLM(LLMBase):
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY
        super().__init__(
            llm_type="gpt",
            model_name=LLM_MODEL_NAME_MAP.get("gpt", settings.LLM_MODEL_NAME)
        )

    def generate(self, prompt: str, mode: str = "default", max_tokens: int = None, stream: bool = False):
        max_tokens = self._calculate_max_tokens(prompt, max_tokens)

        messages = [{"role": "user", "content": prompt}]  # system 메시지 생략

        try:
            if stream:
                response = openai.ChatCompletion.create(
                    model=self.model_name,
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=0.7,
                    top_p=0.95,
                    stream=True
                )

                def generator():
                    for chunk in response:
                        delta = chunk["choices"][0]["delta"]
                        content = delta.get("content", "")
                        if content:
                            yield content

                return generator()

            else:
                response = openai.ChatCompletion.create(
                    model=self.model_name,
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=0.7,
                    top_p=0.95
                )
                return response.choices[0].message.content.strip()

        except Exception as e:
            logger.exception("GPT API 호출 중 오류 발생")
            raise
