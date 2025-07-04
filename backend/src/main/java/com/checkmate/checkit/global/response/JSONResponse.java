package com.checkmate.checkit.global.response;

import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.code.SuccessCode;
import com.checkmate.checkit.global.message.MessageUtil;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonPropertyOrder({"isSuccess", "code", "message", "result"})
public record JSONResponse<T>(
        @JsonProperty(value = "isSuccess") boolean isSuccess,
        int code,
        String message,
        @JsonInclude(Include.NON_NULL) T result
) {

    public static <T> JSONResponse<T> onSuccess(T data) {
        SuccessCode code = SuccessCode.REQUEST_SUCCESS;
        return new JSONResponse<>(true, code.getCode(), code.getMessage(), data);
    }

    public static <T> JSONResponse<T> onSuccess() {
        SuccessCode code = SuccessCode.REQUEST_SUCCESS;
        return new JSONResponse<>(true, code.getCode(), code.getMessage(), null);
    }

    public static <T> JSONResponse<T> of(SuccessCode successCode, T data) {
        return new JSONResponse<>(true, successCode.getCode(), successCode.getMessage(), data);
    }

    public static <T> JSONResponse<T> of(SuccessCode successCode) {
        return new JSONResponse<>(true, successCode.getCode(), successCode.getMessage(), null);
    }

    public static <T> JSONResponse<T> onFailure(ErrorCode errorCode, T data) {
        return new JSONResponse<>(false, errorCode.getCode(), errorCode.getMessage(), data);
    }

    public static <T> JSONResponse<T> onFailure(ErrorCode errorCode) {
        return new JSONResponse<>(false, errorCode.getCode(), errorCode.getMessage(), null);
    }
}