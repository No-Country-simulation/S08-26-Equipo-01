package com.nocountry.qualitytrack.shared.response;

public record ApiResponse<T>(
        boolean success,
        String code,
        String message,
        T data
) {

    public static <T> ApiResponse<T> success(ApiSuccessCode code, String message, T data) {
        return new ApiResponse<>(true, code.name(), message, data);
    }
}
