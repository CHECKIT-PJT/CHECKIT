# schemas/chat_response.py
from pydantic import BaseModel
from typing import Optional

class ChatResponse(BaseModel):
    is_success: bool
    message: Optional[str] = None  # 성공/실패 메시지
    response: Optional[str] = None  # LLM 결과
