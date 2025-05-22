package com.checkmate.checkit.global.code;

import static org.springframework.http.HttpStatus.*;

import org.springframework.http.HttpStatus;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SuccessCode {
	REQUEST_SUCCESS(2000, OK, "요청이 성공적으로 처리되었습니다"),
	SEARCH_SUCCESS(2001, OK, "조회에 성공했습니다"),
	VERIFY_SUCCESS(2002, OK, "인증에 성공했습니다"),

	CREATE_FUNCTIONAL_SPEC_SUCCESS(3000, OK, "기능 명세서 생성에 성공하였습니다."),
	UPDATE_FUNCTIONAL_SPEC_SUCCESS(3001, OK, "기능 명세서 업데이트에 성공하였습니다."),
	DELETE_FUNCTIONAL_SPEC_SUCCESS(3002, OK, "기능 명세서 삭제에 성공하였습니다."),
	GET_FUNCTIONAL_SPEC_SUCCESS(3000, OK, "기능 명세서 생성에 성공하였습니다."),
	;

	private final int code;
	private final HttpStatus httpStatus;
	private final String message;
}
