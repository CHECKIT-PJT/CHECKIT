# 수정된 readme_router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.readme_request import ReadmeGenerationRequest
from schemas.readme_response import ReadmeResponse
from services.readme_service import generate_full_readme
from services.extractor import extract_markdown_block
from fastapi.responses import StreamingResponse
from db.database import get_db
from io import BytesIO

router = APIRouter(prefix="/readme")

@router.post("", response_model=ReadmeResponse)
async def generate_readme(
    request: ReadmeGenerationRequest,
    db: Session = Depends(get_db)
):
    try:
        result = generate_full_readme(request.project_id, db, request.llm_type)
        clean_readme = extract_markdown_block(result)
        return ReadmeResponse(is_success=True, readme=clean_readme.strip())
    except Exception as e:
        return ReadmeResponse(is_success=False, reason=str(e))


@router.post("/download", response_class=StreamingResponse)
async def download_readme(
    request: ReadmeGenerationRequest,
    db: Session = Depends(get_db)
):
    try:
        result = generate_full_readme(request.project_id, db, request.llm_type)
        clean_readme = extract_markdown_block(result)

        buffer = BytesIO()
        buffer.write(clean_readme.strip().encode("utf-8"))
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="text/markdown",
            headers={"Content-Disposition": "attachment; filename=README.md"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

