#services/extractor.py
import re
import json

from config.logger import logger


def extract_markdown_block(text: str) -> str:
    """
    텍스트에서 첫 번째 ```markdown ~ ``` 블록만 추출해서 반환
    """
    start_tag = "```markdown"
    end_tag = "```"

    start_idx = text.find(start_tag)
    if start_idx == -1:
        return text  # 못 찾으면 원본 그대로

    # 시작 인덱스 다음부터 끝나는 지점 찾기
    end_idx = text.find(end_tag, start_idx + len(start_tag))
    if end_idx == -1:
        return text  # 종료 태그 못 찾으면 원본 그대로

    # 중간만 잘라서 반환
    markdown_content = text[start_idx + len(start_tag):end_idx].strip()
    return markdown_content


def extract_plantuml_block(text: str) -> str:
    if not isinstance(text, str):
        logger.warning("⚠️ 입력값이 문자열이 아님")
        return ""

    if "\\n" in text:
        try:
            text = json.loads(f'"{text}"')
            logger.info("✅ \\n 이스케이프 → 줄바꿈 변환 완료")
        except Exception as e:
            logger.warning(f"⚠️ JSON 디코딩 실패: {e}")

    match = re.search(r"```plantuml\s*\n(.+?)```", text, re.DOTALL)
    if match:
        code = match.group(1).strip()
        if "!endum" in code and "@enduml" not in code:
            logger.warning("⚠️ '!endum' → '@enduml' 보정")
            code = code.replace("!endum", "@enduml")
        if not code.endswith("@enduml"):
            code += "\n@enduml"
        if not code.startswith("@startuml"):
            code = "@startuml\n" + code
        logger.info("✅ ```plantuml``` 블록 추출 및 보정 완료")
        return code

    match = re.search(r"(@startuml.*?@enduml)", text, re.DOTALL)
    if match:
        code = match.group(1).strip()
        logger.info("✅ @startuml ~ @enduml 블록 직접 추출 완료")
        return code

    logger.warning("⚠️ 시퀀스 다이어그램 블록을 찾을 수 없음")
    logger.debug(f"🔎 추출 실패 텍스트 일부: {text[:500]}...")
    return ""

