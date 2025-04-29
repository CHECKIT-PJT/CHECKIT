package com.checkmate.checkit.global.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

import static org.springframework.http.HttpStatus.*;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // 서버 에러
    SERVER_ERROR(5000, INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다"),

    // 요청 관련 에러
    INVALID_REQUEST(4000, BAD_REQUEST, "잘못된 요청 형식입니다"),
    NOT_FOUND_ENDPOINT(404, NOT_FOUND, "요청하신 엔드포인트를 찾을 수 없습니다."),
    ;

    private final int code;
    private final HttpStatus httpStatus;
    private final String message;
}
