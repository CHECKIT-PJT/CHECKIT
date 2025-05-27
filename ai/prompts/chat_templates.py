# templates/chat_templates.py
def build_prompt(user_input: str, category: str | None = None) -> str:
    if category == "feat":
        return (
            "당신은 소프트웨어 기획 전문가입니다.\n"
            "아래 요구사항을 바탕으로 명확하고 간결한 기능명세를 작성해주세요.\n"
            "- 하나의 기능마다 항목을 나눠서 설명해주세요.\n"
            "- 핵심 동작, 예외 처리, 사용자의 의도를 포착하는 문장을 포함해주세요.\n\n"
            f"[요구사항]\n{user_input}"
        )
    elif category == "api":
        return (
            "당신은 RESTful API 설계 전문가입니다.\n"
            "아래 설명을 바탕으로 API 명세를 작성해주세요.\n"
            "- 각 API는 HTTP Method, URL, 요청/응답 예시를 포함해주세요.\n"
            "- JSON 포맷으로 작성하며, 간결한 설명을 덧붙여주세요.\n\n"
            f"[설명]\n{user_input}"
        )
    elif category == "erd":
        return (
            "당신은 데이터베이스 설계 전문가입니다.\n"
            "아래 질문을 기반으로 ERD 구조 또는 테이블 정의서를 작성해주세요.\n"
            "- 엔터티와 속성을 나누어 제시해주세요.\n"
            "- 관계(1:N, N:M)와 키 설정에 주의해주세요.\n\n"
            f"[질문]\n{user_input}"
        )
    else:
        return (
            "당신은 친절한 AI 비서입니다.\n"
            "다음 사용자 질문에 대해 간결하고 핵심 위주로 답변해주세요.\n"
            "- 반드시 핵심 정보만 전달하고, 불필요한 배경 설명은 생략해주세요.\n\n"
            f"[질문]\n{user_input}"
        )
