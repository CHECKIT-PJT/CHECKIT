# llm/factory.py
from llm.deepseek import DeepseekLLM
from llm.gemma import GemmaLLM
from llm.gpt import GPTLLM

_llm_instance = None  # 싱글턴 패턴으로 인스턴스 유지

def get_llm(llm_type: str):
    global _llm_instance
    if _llm_instance is None:
        if llm_type == "gemma":
            _llm_instance = GemmaLLM()
        elif llm_type == "gpt":
            _llm_instance = GPTLLM()
        elif llm_type == "deepseek":
            _llm_instance = DeepseekLLM()
        else:
            raise ValueError(f"Unsupported model_type: {llm_type}")
    return _llm_instance
