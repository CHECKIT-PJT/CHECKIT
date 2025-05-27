# prompts/sequence_diagram_templates.py

def build_prompt_from_summary(summary_text: str):
    return (
        "당신은 소프트웨어 아키텍트입니다.\n"
        "아래 API 흐름 요약을 바탕으로 각 API에 대해 명확한 메시지 흐름을 갖는 시퀀스 다이어그램을 작성하세요.\n"
        "- 각 API는 Client → APIGateway → [서비스명]Service 방향의 흐름을 따릅니다.\n"
        "- 각 API에 대해 다음과 같은 흐름을 포함하세요:\n"
        "  1. Client가 어떤 요청을 보내는지\n"
        "  2. APIGateway가 어떤 내부 서비스 함수로 위임하는지\n"
        "  3. Service가 어떤 응답을 주는지\n"
        "  4. 최종적으로 Client에게 어떤 응답을 주는지\n"
        "- 엔드포인트([METHOD] /api/...)를 각 API 구간 시작마다 주석으로 명시해 주세요.\n"
        "- 예시는 다음과 같습니다:\n\n"
        "```plantuml\n"
        "@startuml\n"
        "participant Client\n"
        "participant APIGateway\n"
        "participant AuthService\n\n"
        "== [POST] /api/auth/login ==\n"
        "Client -> APIGateway: POST /api/auth/login\n"
        "APIGateway -> AuthService: authenticateUser()\n"
        "AuthService -> APIGateway: JWT token\n"
        "APIGateway -> Client: 200 OK + token\n"
        "@enduml\n"
        "```\n\n"
        f"{summary_text.strip()}\n\n"
        "```plantuml\n"
    )

# def build_prompt_from_summary(summary_text: str):
#     return (
#         "당신은 소프트웨어 아키텍트입니다.\n"
#         "아래 요약된 API 흐름을 기반으로 시퀀스 다이어그램을 작성하세요.\n"
#         "- 요청 흐름: Client → APIGateway → 처리 서비스\n"
#         "- 응답 흐름: 처리 서비스 → APIGateway → Client\n"
#         "- participant는 반드시 다음 세 가지 중 하나만 사용: Client, APIGateway, [서비스명]Service\n"
#         "- participant 이름에는 절대 괄호를 붙이지 마세요. (예: AuthService (O), AuthService(Login) (X))\n"
#         "- 아래 구문은 절대 사용하지 마세요: `Person`, `Rel`, `Start`, `Finish`, `!include`\n"
#         "- 반드시 표준 PlantUML만 사용하세요. 아래는 예시입니다:\n\n"
#         "```plantuml\n"
#         "@startuml\n"
#         "participant Client\n"
#         "participant APIGateway\n"
#         "participant AuthService\n"
#         "Client -> APIGateway: 요청\n"
#         "APIGateway -> AuthService: 처리\n"
#         "AuthService -> APIGateway: 응답\n"
#         "APIGateway -> Client: 결과\n"
#         "@enduml\n"
#         "```\n\n"
#         f"{summary_text.strip()}\n\n"
#         "```plantuml\n"
#     )


def build_api_summary_prompt(api_spec_list):
    prompt = (
        "당신은 백엔드 아키텍트입니다.\n"
        "아래 API 목록을 참고하여 각 API가 어떻게 동작하는지 한두 문장으로 요약해 주세요.\n"
        "- 형식: [METHOD] /endpoint - 설명\n"
        "- 요약은 '사용자가 ~하면 ~된다' 또는 'Client → APIGateway → 서비스' 식으로 흐름 중심으로 써 주세요.\n"
        "- participant는 반드시: Client, APIGateway, 서비스명(*Service)만 사용하며 괄호를 붙이지 마세요.\n\n"
    )
    prompt += "API 목록:\n"
    for idx, api in enumerate(api_spec_list, 1):
        prompt += f"{idx}. [{api.method}] {api.endpoint} - {api.description or '설명 없음'}\n"
    prompt += "\n[API 흐름 요약]:\n"
    return prompt



