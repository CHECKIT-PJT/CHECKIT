# utils/token_config.py

MODEL_TOKEN_CONFIG = {
    "gemma": {
        "context": 2048,
        "safety": 128,
        "min_completion": 256,
        "tokenizer": "google/gemma-2b-it",
    },
    "gpt": {
        "context": 8192,
        "safety": 256,
        "min_completion": 512,
        "tokenizer": None,  # ✅ 또는 생략
    },
    "deepseek": {
        "context": 2048,
        "safety": 128,
        "min_completion": 256,
        "tokenizer": "deepseek-ai/deepseek-coder-1.3b-instruct",
    },
    "mistral": {
        "context": 4096,
        "safety": 128,
        "min_completion": 256,
        "tokenizer": "TheBloke/Mistral-7B-v0.1-GPTQ",
    }
}

def get_token_policy(llm_type: str) -> dict:
    return MODEL_TOKEN_CONFIG.get(llm_type, MODEL_TOKEN_CONFIG["gemma"])
