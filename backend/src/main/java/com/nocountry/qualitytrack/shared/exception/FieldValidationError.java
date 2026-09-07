package com.nocountry.qualitytrack.shared.exception;

public record FieldValidationError(
        String field,
        String code,
        String message
) {
}
