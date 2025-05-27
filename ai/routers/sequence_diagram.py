from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
from config.logger import logger
from db.database import get_db
from schemas.sequence_request import SequenceDiagramRequest
from schemas.sequence_response import SequenceDiagramResponse
from services.sequence_service import generate_sequence_diagram_response
from utils.plantuml import plantuml_encode
import requests
import io

router = APIRouter(prefix="/sequence")


@router.post("", response_model=SequenceDiagramResponse)
def generate_sequence_diagram(request: SequenceDiagramRequest, db: Session = Depends(get_db)):
    try:
        if not request.category:
            raise HTTPException(status_code=400, detail="카테고리를 입력해주세요")
        return generate_sequence_diagram_response(request, db)
    except Exception as e:
        logger.error(f"[ERROR] 시퀀스 생성 실패: {e}")
        return SequenceDiagramResponse(plantuml_code="", diagram_url=None)


@router.post("/download", response_class=StreamingResponse)
def download_sequence_diagram(request: SequenceDiagramRequest, db: Session = Depends(get_db)):
    try:
        if not request.category:
            raise HTTPException(status_code=400, detail="카테고리를 입력해주세요")

        result = generate_sequence_diagram_response(request, db)
        if not result.plantuml_code:
            raise HTTPException(status_code=400, detail="시퀀스 다이어그램 생성 실패")

        encoded = plantuml_encode(result.plantuml_code)
        image_url = f"https://www.plantuml.com/plantuml/png/{encoded}"

        response = requests.get(image_url)
        response.raise_for_status()

        return StreamingResponse(
            io.BytesIO(response.content),
            media_type="image/png",
            headers={"Content-Disposition": "attachment; filename=sequence_diagram.png"}
        )
    except Exception as e:
        logger.error(f"[ERROR] 시퀀스 이미지 다운로드 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))
