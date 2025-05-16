package com.checkmate.checkit.global.exception;

import com.checkmate.checkit.global.code.ErrorCode;
import lombok.Getter;

@Getter
public class CommonException extends RuntimeException {
	private final ErrorCode errorCode;
	private final String detail;

	public CommonException(ErrorCode errorCode) {
		this.errorCode = errorCode;
		this.detail = null;
	}

	public CommonException(ErrorCode errorCode, String detail) {
		this.errorCode = errorCode;
		this.detail = detail;
	}
}
