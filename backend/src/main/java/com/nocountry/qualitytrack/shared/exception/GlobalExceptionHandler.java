package com.nocountry.qualitytrack.shared.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ProblemDetail;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.List;

@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private final ProblemDetailFactory problemDetailFactory;

    @ExceptionHandler(BusinessException.class)
    ProblemDetail handleBusinessException(BusinessException exception, HttpServletRequest request) {
        return problemDetailFactory.create(exception.getCode(), exception.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail handleValidation(MethodArgumentNotValidException exception, HttpServletRequest request) {
        ProblemDetail problem = problemDetailFactory.create(
                ApiErrorCode.VALIDATION_ERROR,
                "Uno o más campos contienen valores inválidos.",
                request
        );

        List<FieldValidationError> errors = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> new FieldValidationError(
                        error.getField(),
                        validationCode(error.getCode()),
                        error.getDefaultMessage()
                ))
                .toList();

        problem.setProperty("errors", errors);
        return problem;
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ProblemDetail handleMalformedRequest(HttpMessageNotReadableException exception, HttpServletRequest request) {
        return problemDetailFactory.create(
                ApiErrorCode.MALFORMED_REQUEST,
                "No se pudo interpretar el cuerpo de la solicitud.",
                request
        );
    }

    @ExceptionHandler(NoResourceFoundException.class)
    ProblemDetail handleNotFound(NoResourceFoundException exception, HttpServletRequest request) {
        return problemDetailFactory.create(
                ApiErrorCode.RESOURCE_NOT_FOUND,
                "No se encontró el recurso solicitado.",
                request
        );
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    ProblemDetail handleMethodNotAllowed(HttpRequestMethodNotSupportedException exception, HttpServletRequest request) {
        return problemDetailFactory.create(
                ApiErrorCode.METHOD_NOT_ALLOWED,
                "El método HTTP no está permitido para este recurso.",
                request
        );
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    ProblemDetail handleUnsupportedMediaType(HttpMediaTypeNotSupportedException exception, HttpServletRequest request) {
        return problemDetailFactory.create(
                ApiErrorCode.UNSUPPORTED_MEDIA_TYPE,
                "El tipo de contenido de la solicitud no es compatible.",
                request
        );
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ProblemDetail handleDataConflict(DataIntegrityViolationException exception, HttpServletRequest request) {
        return problemDetailFactory.create(
                ApiErrorCode.DATA_CONFLICT,
                "La solicitud entra en conflicto con el estado actual de los datos.",
                request
        );
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail handleUnexpected(Exception exception, HttpServletRequest request) {
        LOGGER.error("Unhandled application error", exception);
        return problemDetailFactory.create(
                ApiErrorCode.INTERNAL_ERROR,
                "Ocurrió un error inesperado.",
                request
        );
    }

    private String validationCode(String annotationCode) {
        if (annotationCode == null) {
            return "INVALID_VALUE";
        }

        return switch (annotationCode) {
            case "NotBlank", "NotNull" -> "REQUIRED";
            case "Email" -> "INVALID_EMAIL";
            case "Size" -> "INVALID_SIZE";
            default -> "INVALID_VALUE";
        };
    }
}
