# config/settings.py
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    HF_TOKEN: str = os.getenv("HF_TOKEN")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    VLLM_BASE_URL: str = os.getenv("VLLM_BASE_URL")  # http://localhost:8000/v1
    LLM_MODEL_NAME: str = os.getenv("LLM_MODEL_NAME")  # gemma-2b-it
settings = Settings()
