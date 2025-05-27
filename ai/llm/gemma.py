# llm/gemma.py

from config.model_map import LLM_MODEL_NAME_MAP
from config.settings import settings
from llm.base import LLMBase
from config.logger import logger
import requests, json

class GemmaLLM(LLMBase):
    def __init__(self):
        super().__init__(llm_type="gemma", model_name=LLM_MODEL_NAME_MAP.get("gemma", settings.LLM_MODEL_NAME))
        self.base_url = settings.VLLM_BASE_URL

    def generate(self, prompt: str, mode: str = "default", max_tokens: int = None, stream: bool = False) -> str:
        max_tokens = self._calculate_max_tokens(prompt, max_tokens)

        if mode == "chat":
            api_url = f"{self.base_url}/v1/chat/completions"
            payload = {
                "model": self.model_name,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": max_tokens,
                "temperature": 0.3,
                "top_p": 0.9,
                "stream": stream
            }

            response = requests.post(api_url, json=payload, stream=True)
            response.raise_for_status()
            if stream:
                streamed_text = ""
                for line in response.iter_lines():
                    if line:
                        if line.strip() == b"data: [DONE]":
                            break
                        try:
                            json_line = json.loads(line.decode("utf-8").replace("data: ", ""))
                            content = json_line["choices"][0].get("delta", {}).get("content", "")
                            streamed_text += content
                        except Exception as e:
                            logger.warning(f"⚠️ 스트리밍 파싱 실패: {e}")
                return streamed_text.strip()
            else:
                response_json = response.json()
                return response_json["choices"][0]["message"]["content"].strip()
        elif mode in {"summary", "sequence", "readme", "default"}:
            api_url = f"{self.base_url}/v1/completions"
            payload = {
                "model": self.model_name,
                "prompt": prompt,
                "max_tokens": max_tokens,
                "temperature": 0.8,
                "top_p": 0.95
            }
            response = requests.post(api_url, json=payload)
            response.raise_for_status()
            logger.debug(f"LLM 응답 상태: {response.status_code}")
            logger.debug(f"LLM 응답 raw: {response.text}")
            response_json = response.json()

            return response_json["choices"][0]["text"].strip()
        else:
            raise ValueError(f"지원하지 않는 mode입니다: {mode}")

