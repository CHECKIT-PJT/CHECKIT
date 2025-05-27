from pydantic import BaseModel
from typing import Optional

class ReadmeResponse(BaseModel):
    is_success: bool
    readme: Optional[str] = None
    reason: Optional[str] = None
