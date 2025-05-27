from typing import Optional
from pydantic import BaseModel

class SequenceDiagramResponse(BaseModel):
    plantuml_code: str
    diagram_url: Optional[str] = None
