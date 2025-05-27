# services/chat_service.py
from llm.invoke import get_llm_response
from prompts.chat_templates import build_prompt
from schemas.chat_request import ChatRequest

def get_chat_response(body: ChatRequest) -> str:
    prompt = build_prompt(body.message, body.category)
    return get_llm_response(prompt, model_type=body.llm_type, mode="chat", max_tokens=None, stream=False)

def get_chat_stream_response(body: ChatRequest):
    prompt = build_prompt(body.message, body.category)
    return get_llm_response(prompt, model_type=body.llm_type, mode="chat", max_tokens=None, stream=True)