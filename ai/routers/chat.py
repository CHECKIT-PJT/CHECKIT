# routers/chat.py
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from schemas.chat_request import ChatRequest
from schemas.chat_response import ChatResponse
from services.chat_service import get_chat_response, get_chat_stream_response

router = APIRouter(prefix="/chat")

@router.post("", response_model=ChatResponse)
def chat_endpoint(body: ChatRequest):
    try:
        response = get_chat_response(body)
        return ChatResponse(
            is_success=True,
            message="성공적으로 처리되었습니다.",
            response=response
        )
    except Exception as e:
        return ChatResponse(
            is_success=False,
            message=f"⚠️ 처리 중 오류 발생: {str(e)}",
            response=None
        )


@router.post("/stream")
def chat_stream_endpoint(body: ChatRequest):
    def generate():
        for token in get_chat_stream_response(body):
            yield token
    return StreamingResponse(generate(), media_type="text/plain")

