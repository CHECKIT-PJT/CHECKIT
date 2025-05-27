# prompts/readme_templates.py

SUMMARY_PREFIX = (
    "당신은 소프트웨어 아키텍트입니다.\n\n"
    "아래는 서비스의 주요 기능 설명입니다. 각 항목을 읽고, 핵심 기능만 간결하게 **한국어**로 요약해 주세요.\n"
    "- 카테고리별로 한두 문장 이내로 작성하세요.\n"
    "- 불필요한 반복이나 중복은 제거하세요.\n"
)


SUMMARY_SUFFIX = "\n\n카테고리별 요약:\n"

README_PREFIX = (
    "당신은 소프트웨어 문서화 전문가입니다.\n"
    "아래의 기능 명세서를 기반으로 실무에서 활용 가능한 **README.md** 파일을 작성해주세요.\n\n"
    "README.md는 다음 형식을 따라야 합니다:\n"
    "1. 프로젝트 소개 (프로젝트 목표 및 문제 해결 방법)\n"
    "2. 기술 스택 (Frontend / Backend / Database / Infra)\n"
    "3. 주요 기능 요약 (각 기능을 간결히 정리)\n"
    "4. 설치 및 실행 방법 (Git clone → 의존성 설치 → 실행)\n"
    "5. 추가 정보 (주의사항, 향후 개선사항 등)\n\n"
    "각 항목은 마크다운 형식으로 작성하고, 문장 흐름은 자연스럽고 읽기 쉽게 구성해주세요.\n"
)

README_SUFFIX = "---\n\n# README.md\n\n"

def build_summary_prompt(spec_text: str) -> str:
    return f"{SUMMARY_PREFIX}{spec_text.strip()}{SUMMARY_SUFFIX}"

def build_prompt_from_functional_specs(function_spec=None):
    prompt = README_PREFIX
    if function_spec:
        prompt += f"## 기능 명세서\n{function_spec}\n\n"
    prompt += README_SUFFIX
    return prompt
