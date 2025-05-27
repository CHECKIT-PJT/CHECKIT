from pydantic import BaseModel

class SequenceDiagramRequest(BaseModel):
    project_id: int
    llm_type: str
    category: str  # 이제 필수 처리