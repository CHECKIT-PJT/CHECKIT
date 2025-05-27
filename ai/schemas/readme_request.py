from pydantic import BaseModel, Field

class ReadmeGenerationRequest(BaseModel):
    project_id: int = Field(..., description="README를 생성할 프로젝트의 ID")
    llm_type: str = Field(default="gemma", description="사용할 LLM 모델 타입 (예: gemma, mistral 등)")
