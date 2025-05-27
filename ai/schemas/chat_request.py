# schemas/chat_request.py

from pydantic import BaseModel, Field
from typing import Optional

class ChatRequest(BaseModel):
    message: str
    category: Optional[str] = None
    llm_type: str = Field(default="gemma", description="사용할 LLM 모델 타입 (예: gemma, mistral 등)")