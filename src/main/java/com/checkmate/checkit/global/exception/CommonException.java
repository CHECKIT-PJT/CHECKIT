package com.checkmate.checkit.global.exception;

import com.checkmate.checkit.global.code.ErrorCode;
import lombok.Getter;

@Getter
public class CommonException extends RuntimeException {
    private final ErrorCode errorCode;

    public CommonException(ErrorCode errorCode) {
        this.errorCode = errorCode;
    }
}
