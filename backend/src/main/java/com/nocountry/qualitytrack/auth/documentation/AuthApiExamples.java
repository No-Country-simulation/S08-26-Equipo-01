package com.nocountry.qualitytrack.auth.documentation;

final class AuthApiExamples {

    static final String REGISTER_SUCCESS = """
            {
              "success": true,
              "code": "AUTH_REGISTERED",
              "message": "Registro completado. Verifica tu correo electrónico para activar la cuenta.",
              "data": {
                "userId": 42,
                "email": "user@example.com",
                "status": "PENDING_VERIFICATION"
              }
            }
            """;

    static final String EMAIL_VERIFIED = """
            {
              "success": true,
              "code": "EMAIL_VERIFIED",
              "message": "Correo electrónico verificado correctamente.",
              "data": null
            }
            """;

    static final String VERIFICATION_EMAIL_SENT = """
            {
              "success": true,
              "code": "VERIFICATION_EMAIL_SENT",
              "message": "Si la cuenta cumple con los requisitos, se enviará un correo de verificación.",
              "data": null
            }
            """;

    static final String AUTHENTICATED = """
            {
              "success": true,
              "code": "AUTHENTICATED",
              "message": "Autenticación exitosa.",
              "data": {
                "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
                "tokenType": "Bearer",
                "expiresIn": 900
              }
            }
            """;

    static final String PASSWORD_RESET_EMAIL_SENT = """
            {
              "success": true,
              "code": "PASSWORD_RESET_EMAIL_SENT",
              "message": "Si existe una cuenta asociada a ese correo, se enviarán las instrucciones para restablecer la contraseña.",
              "data": null
            }
            """;

    static final String PASSWORD_RESET_COMPLETED = """
            {
              "success": true,
              "code": "PASSWORD_RESET_COMPLETED",
              "message": "Contraseña restablecida correctamente.",
              "data": null
            }
            """;

    static final String VALIDATION_ERROR = """
            {
              "type": "urn:qualitytrack:problem:validation-error",
              "title": "Error de validación",
              "status": 400,
              "detail": "Uno o más campos contienen valores inválidos.",
              "instance": "/api/v1/auth/register",
              "code": "VALIDATION_ERROR",
              "errors": [
                {
                  "field": "email",
                  "code": "INVALID_EMAIL",
                  "message": "El correo electrónico no tiene un formato válido."
                }
              ]
            }
            """;

    static final String EMAIL_ALREADY_EXISTS = """
            {
              "type": "urn:qualitytrack:problem:email-already-exists",
              "title": "Conflicto",
              "status": 409,
              "detail": "Ya existe una cuenta asociada a este correo electrónico.",
              "instance": "/api/v1/auth/register",
              "code": "EMAIL_ALREADY_EXISTS"
            }
            """;

    static final String INVALID_CREDENTIALS = """
            {
              "type": "urn:qualitytrack:problem:invalid-credentials",
              "title": "Credenciales inválidas",
              "status": 401,
              "detail": "El correo electrónico o la contraseña son incorrectos.",
              "instance": "/api/v1/auth/login",
              "code": "INVALID_CREDENTIALS"
            }
            """;

    static final String INVALID_VERIFICATION_TOKEN = """
            {
              "type": "urn:qualitytrack:problem:invalid-verification-token",
              "title": "Token de verificación inválido",
              "status": 400,
              "detail": "El token de verificación no es válido.",
              "instance": "/api/v1/auth/verify-email",
              "code": "INVALID_VERIFICATION_TOKEN"
            }
            """;

    static final String VERIFICATION_TOKEN_EXPIRED = """
            {
              "type": "urn:qualitytrack:problem:verification-token-expired",
              "title": "Token de verificación expirado",
              "status": 410,
              "detail": "El token de verificación ha expirado.",
              "instance": "/api/v1/auth/verify-email",
              "code": "VERIFICATION_TOKEN_EXPIRED"
            }
            """;

    static final String INVALID_PASSWORD_RESET_TOKEN = """
            {
              "type": "urn:qualitytrack:problem:invalid-password-reset-token",
              "title": "Token de restablecimiento inválido",
              "status": 400,
              "detail": "El token para restablecer la contraseña no es válido.",
              "instance": "/api/v1/auth/reset-password",
              "code": "INVALID_PASSWORD_RESET_TOKEN"
            }
            """;

    static final String PASSWORD_RESET_TOKEN_EXPIRED = """
            {
              "type": "urn:qualitytrack:problem:password-reset-token-expired",
              "title": "Token de restablecimiento expirado",
              "status": 410,
              "detail": "El token para restablecer la contraseña ha expirado.",
              "instance": "/api/v1/auth/reset-password",
              "code": "PASSWORD_RESET_TOKEN_EXPIRED"
            }
            """;

    static final String EMAIL_DELIVERY_FAILED = """
            {
              "type": "urn:qualitytrack:problem:email-delivery-failed",
              "title": "Servicio de correo no disponible",
              "status": 503,
              "detail": "El servicio de correo no está disponible temporalmente.",
              "instance": "/api/v1/auth/register",
              "code": "EMAIL_DELIVERY_FAILED"
            }
            """;

    private AuthApiExamples() {
    }
}
