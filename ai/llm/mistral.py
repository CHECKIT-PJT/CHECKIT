# llm/mistral.py

# llm/mistral.py

import requests
import json

from config.model_map import LLM_MODEL_NAME_MAP
from config.settings import settings
from llm.base import LLMBase
from config.logger import logger

class MistralLLM(LLMBase):
    def __init__(self):
        super().__init__(
            llm_type="mistral",
            model_name=LLM_MODEL_NAME_MAP.get("mistral", settings.LLM_MODEL_NAME)
        )
        self.base_url = settings.VLLM_BASE_URL  # 예: http://localhost:8000

    def generate(self, prompt: str, mode: str = "default", max_tokens: int = None, stream: bool = False):
        max_tokens = self._calculate_max_tokens(prompt, max_tokens)

        api_url = f"{self.base_url}/v1/chat/completions"
        messages = [{"role": "user", "content": prompt}]

        payload = {
            "model": self.model_name,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.7,
            "top_p": 0.9,
            "stream": stream
        }

        logger.debug(f"LLM 호출: {api_url}")
        logger.debug(f"LLM payload: {payload}")

        if stream:
            response = requests.post(api_url, json=payload, stream=True)
            response.raise_for_status()

            def stream_generator():
                for line in response.iter_lines():
                    if line:
                        if line.strip() == b"data: [DONE]":
                            break
                        try:
                            json_line = json.loads(line.decode("utf-8").replace("data: ", ""))
                            content = json_line["choices"][0].get("delta", {}).get("content", "")
                            yield content
                        except Exception as e:
                            logger.warning(f"⚠️ 스트리밍 파싱 실패: {e}")
            return stream_generator()

        else:
            response = requests.post(api_url, json=payload)
            response.raise_for_status()
            logger.debug(f"LLM 응답 상태: {response.status_code}")
            logger.debug(f"LLM 응답 raw: {response.text}")

            return response.json()["choices"][0]["message"]["content"].strip()
