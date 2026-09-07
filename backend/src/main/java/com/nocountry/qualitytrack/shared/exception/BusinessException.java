package com.nocountry.qualitytrack.shared.exception;

public class BusinessException extends RuntimeException {

    private final ApiErrorCode code;

    public BusinessException(ApiErrorCode code, String message) {
        super(message);
        this.code = code;
    }

    public ApiErrorCode getCode() {
        return code;
    }
}
