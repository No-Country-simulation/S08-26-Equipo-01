package com.nocountry.qualitytrack.shared.exception;

import org.springframework.http.HttpStatus;

public enum ApiErrorCode {
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Error de validación"),
    MALFORMED_REQUEST(HttpStatus.BAD_REQUEST, "Solicitud inválida"),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "Conflicto"),
    DATA_CONFLICT(HttpStatus.CONFLICT, "Conflicto"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Credenciales inválidas"),
    AUTHENTICATION_REQUIRED(HttpStatus.UNAUTHORIZED, "Autenticación requerida"),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "Acceso denegado"),
    INVALID_VERIFICATION_TOKEN(HttpStatus.BAD_REQUEST, "Token de verificación inválido"),
    VERIFICATION_TOKEN_EXPIRED(HttpStatus.GONE, "Token de verificación expirado"),
    VERIFICATION_NOT_AVAILABLE(HttpStatus.BAD_REQUEST, "Verificación no disponible"),
    INVALID_PASSWORD_RESET_TOKEN(HttpStatus.BAD_REQUEST, "Token de restablecimiento inválido"),
    PASSWORD_RESET_TOKEN_EXPIRED(HttpStatus.GONE, "Token de restablecimiento expirado"),
    INVALID_CUSTOMER_INVITATION_TOKEN(HttpStatus.BAD_REQUEST, "Invitación inválida"),
    CUSTOMER_INVITATION_EXPIRED(HttpStatus.GONE, "Invitación expirada"),
    EMAIL_DELIVERY_FAILED(HttpStatus.SERVICE_UNAVAILABLE, "Servicio de correo no disponible"),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "Recurso no encontrado"),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "Método no permitido"),
    UNSUPPORTED_MEDIA_TYPE(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Tipo de contenido no compatible"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor");

    private final HttpStatus status;
    private final String title;

    ApiErrorCode(HttpStatus status, String title) {
        this.status = status;
        this.title = title;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getTitle() {
        return title;
    }
}
