package com.checkmate.checkit.global.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

import static org.springframework.http.HttpStatus.OK;

@Getter
@RequiredArgsConstructor
public enum SuccessCode {
    REQUEST_SUCCESS(2000, OK, "요청이 성공적으로 처리되었습니다"),
    SEARCH_SUCCESS(2001, OK, "조회에 성공했습니다"),
    ;

    private final int code;
    private final HttpStatus httpStatus;
    private final String message;
}
