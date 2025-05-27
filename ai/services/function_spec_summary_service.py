# services/function_spec_summary_service.py

from sqlalchemy.orm import Session
from sqlalchemy import case
from models.functional_spec import FunctionalSpec
from collections import defaultdict
from llm.invoke import get_llm_response
from utils.token_utils import truncate_lines_to_fit_token_limit
from utils.constants import get_token_constants  # ✅ 변경된 import

MAX_ITEMS_PER_CATEGORY = 2
MAX_TOTAL_ITEMS = 8

def get_summarized_function_specs(project_id: int, db: Session, llm_type: str) -> str:
    specs = db.query(
        FunctionalSpec.category,
        FunctionalSpec.function_name,
        FunctionalSpec.function_description
    ).filter(
        FunctionalSpec.project_id == project_id,
        FunctionalSpec.is_deleted == 0,
        FunctionalSpec.function_description.isnot(None)
    ).order_by(
        case(
            (FunctionalSpec.priority == None, 1),
            else_=0
        ),
        FunctionalSpec.priority.asc(),
        FunctionalSpec.story_point.desc(),
        FunctionalSpec.updated_at.desc()
    ).all()

    if not specs:
        raise ValueError("해당 프로젝트에 대한 기능 명세서를 찾을 수 없습니다.")

    # 카테고리별로 핵심 기능만 제한적으로 추출
    category_map = defaultdict(list)
    total_items = 0
    for spec in specs:
        if total_items >= MAX_TOTAL_ITEMS:
            break
        if len(category_map[spec.category]) < MAX_ITEMS_PER_CATEGORY:
            category_map[spec.category].append(spec)
            total_items += 1

    spec_lines = [
        f"- {category} - {spec.function_name}: {spec.function_description or ''}"
        for category, items in category_map.items()
        for spec in items
    ]

    # ✅ 모델별 토큰 정책 동적 적용
    token_config = get_token_constants(llm_type)
    prompt, max_tokens = truncate_lines_to_fit_token_limit(
        lines=spec_lines,
        llm_type=llm_type,
        max_total_tokens=token_config["SAFE_CONTEXT_TOKENS"],
        reserved_completion_tokens=token_config["MIN_COMPLETION_TOKENS"],
        template_tokens=token_config["SUMMARY_TEMPLATE_TOKENS"]
    )

    return get_llm_response(prompt, model_type=llm_type, mode="summary", max_tokens=max_tokens)
