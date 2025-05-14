package com.checkmate.checkit.global.code;

import static org.springframework.http.HttpStatus.*;

import org.springframework.http.HttpStatus;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
	// 서버 에러
	SERVER_ERROR(500, INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다"),

	// 요청 관련 에러
	INVALID_REQUEST(400, BAD_REQUEST, "잘못된 요청 형식입니다"),
	NOT_FOUND_ENDPOINT(404, NOT_FOUND, "요청하신 엔드포인트를 찾을 수 없습니다."),

	// JWT 관련 에러
	INVALID_JWT_SIGNATURE(401, UNAUTHORIZED, "유효하지 않은 JWT 서명입니다."),
	INVALID_JWT_TOKEN(401, UNAUTHORIZED, "유효하지 않은 JWT 토큰입니다."),
	EXPIRED_JWT_TOKEN(401, UNAUTHORIZED, "만료된 JWT 토큰입니다."),
	UNSUPPORTED_JWT_TOKEN(401, UNAUTHORIZED, "지원하지 않는 JWT 토큰입니다."),
	EMPTY_JWT_TOKEN(400, BAD_REQUEST, "JWT 토큰이 비어있습니다."),
	BLACKLISTED_JWT_TOKEN(401, UNAUTHORIZED, "로그아웃된 토큰입니다."),

	// OAuth 관련 에러
	OAuth2AccessDeniedException(403, FORBIDDEN, "OAuth2 인증이 거부되었습니다."),
	OAuth2AuthenticationException(401, UNAUTHORIZED, "OAuth2 인증에 실패했습니다."),
	OAuth2AuthenticationProcessingFilter(401, UNAUTHORIZED, "OAuth2 인증 처리 필터에서 오류가 발생했습니다."),
	OAuth2AuthenticationRedirectFilter(401, UNAUTHORIZED, "OAuth2 인증 리다이렉트 필터에서 오류가 발생했습니다."),

	// 회원 관련 에러
	USER_NOT_FOUND(404, NOT_FOUND, "등록된 회원을 찾을 수 없습니다."),

	// 프로젝트 관련 에러
	INVALID_PROJECT_NAME(400, BAD_REQUEST, "프로젝트 이름이 유효하지 않습니다."),
	PROJECT_NAME_TOO_LONG(400, BAD_REQUEST, "프로젝트 이름은 50자 이내여야 합니다."),
	PROJECT_NOT_FOUND(404, NOT_FOUND, "프로젝트를 찾을 수 없습니다."),
	UNAUTHORIZED_PROJECT_ACCESS(403, FORBIDDEN, "프로젝트에 대한 접근 권한이 없습니다."),
	CANNOT_LEAVE_PROJECT_OWNER(403, FORBIDDEN, "프로젝트 소유자는 프로젝트를 나갈 수 없습니다."),
	CANNOT_DELETE_PROJECT_MEMBER(403, FORBIDDEN, "프로젝트 소유자만 프로젝트를 삭제할 수 있습니다."),
	PROJECT_MEMBER_EXISTS(400, BAD_REQUEST, "프로젝트에 멤버가 존재하여 삭제할 수 없습니다."),
	ALREADY_MEMBER(400, BAD_REQUEST, "이미 프로젝트에 참여 요청을 했거나 가입한 상태입니다."),
	INVALID_INVITE_CODE(400, BAD_REQUEST, "유효하지 않은 초대 코드입니다."),
	INVALID_INVITE_MEMBER(400, BAD_REQUEST, "초대된 멤버가 아닙니다."),

	// 코드 생성 관련 에러 추가
	SPRING_SETTINGS_NOT_FOUND(404, BAD_REQUEST, "Spring 설정이 존재하지 않거나 잘못되었습니다."),
	ERD_NOT_FOUND(405, NOT_FOUND, "ERD 데이터가 존재하지 않습니다."),
	API_SPEC_NOT_FOUND(401, BAD_REQUEST, "API 명세서가 존재하지 않습니다."),
	ERD_PARSING_FAILED(500, INTERNAL_SERVER_ERROR, "ERD 파싱 중 오류가 발생했습니다."),
	FUNCTIONAL_SPEC_NOT_FOUND(402, BAD_REQUEST, "기능 명세서가 존재하지 않습니다."),
	// 이메일 관련 에러
	MAIL_SEND_FAILED(500, INTERNAL_SERVER_ERROR, "이메일 전송에 실패했습니다."),

	//Spring 프로젝트 관련 에러
	SPRING_PROJECT_DOWNLOAD(404, BAD_REQUEST, "Spring 프로젝트 다운로드 실패"),
	SPRING_CODE_FILE_SAVE(400, BAD_REQUEST, "코드 파일 저장 실패"),

	// Git 관련 에러
	GIT_SETTING_NOT_FOUND(404, NOT_FOUND, "Git 설정을 찾을 수 없습니다."),
	GIT_IGNORE_NOT_FOUND(404, NOT_FOUND, "GitIgnore를 찾을 수 없습니다."),
	BRANCH_STRATEGY_NOT_FOUND(404, NOT_FOUND, "Branch 전략을 찾을 수 없습니다."),
	COMMIT_CONVENTION_NOT_FOUND(404, NOT_FOUND, "Commit 규칙을 찾을 수 없습니다."),
	FAILED_TO_CREATE_REPOSITORY(500, INTERNAL_SERVER_ERROR, "레포지토리 생성에 실패했습니다."),
	FAILED_TO_PUSH_REPOSITORY(500, INTERNAL_SERVER_ERROR, "레포지토리 푸시에 실패했습니다."),

	// 도커 관련 에러
	INVALID_DATABASE_TYPE(400, BAD_REQUEST, "유효하지 않은 데이터베이스 타입입니다."),
	DOCKER_COMPOSE_NOT_FOUND(404, NOT_FOUND, "Docker Compose 파일을 찾을 수 없습니다."),

	// README 관련 에러
	README_NOT_FOUND(404, NOT_FOUND, "README 파일을 찾을 수 없습니다."),

	// 시퀀스 다이어그램 관련 에러
	SEQUENCE_DIAGRAM_NOT_FOUND(404, NOT_FOUND, "시퀀스 다이어그램을 찾을 수 없습니다."),

	// Jira 관련 에러
	JIRA_PROJECT_NOT_FOUND(404, NOT_FOUND, "Jira에 연동된 프로젝트를 찾을 수 없습니다."),
	;

	private final int code;
	private final HttpStatus httpStatus;
	private final String message;
}
