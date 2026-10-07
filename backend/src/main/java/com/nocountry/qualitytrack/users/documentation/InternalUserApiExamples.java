package com.nocountry.qualitytrack.users.documentation;

final class InternalUserApiExamples {

    static final String INTERNAL_INVITATION_CREATED = """
            {
              "success": true,
              "code": "INTERNAL_INVITATION_CREATED",
              "message": "Invitación interna enviada correctamente.",
              "data": {
                "userId": 42,
                "firstName": "Ana",
                "lastName": "López",
                "email": "ana@qualitytrack.com",
                "roles": ["QUALITY", "AUDITOR"],
                "status": "PENDING_ACTIVATION",
                "expiresAt": "2026-09-16T03:30:00Z"
              }
            }
            """;

    static final String INTERNAL_INVITATION_RESOLVED = """
            {
              "success": true,
              "code": "INTERNAL_INVITATION_RESOLVED",
              "message": "Invitación interna disponible.",
              "data": {
                "firstName": "Ana",
                "lastName": "López",
                "email": "ana@qualitytrack.com",
                "roles": ["QUALITY", "AUDITOR"],
                "expiresAt": "2026-09-16T03:30:00Z"
              }
            }
            """;

    static final String INTERNAL_INVITATION_ACCEPTED = """
            {
              "success": true,
              "code": "INTERNAL_INVITATION_ACCEPTED",
              "message": "Cuenta interna activada correctamente. Ya puedes iniciar sesión.",
              "data": {
                "userId": 42,
                "email": "ana@qualitytrack.com",
                "roles": ["QUALITY", "AUDITOR"],
                "status": "ACTIVE"
              }
            }
            """;

    static final String VALIDATION_ERROR = """
            {
              "type": "urn:qualitytrack:problem:validation-error",
              "title": "Error de validación",
              "status": 400,
              "detail": "Uno o más campos contienen valores inválidos.",
              "code": "VALIDATION_ERROR"
            }
            """;

    static final String AUTHENTICATION_REQUIRED = """
            {
              "type": "urn:qualitytrack:problem:authentication-required",
              "title": "Autenticación requerida",
              "status": 401,
              "detail": "Debes autenticarte para acceder a este recurso.",
              "code": "AUTHENTICATION_REQUIRED"
            }
            """;

    static final String ACCESS_DENIED = """
            {
              "type": "urn:qualitytrack:problem:access-denied",
              "title": "Acceso denegado",
              "status": 403,
              "detail": "Solo un administrador interno activo puede invitar usuarios internos.",
              "code": "ACCESS_DENIED"
            }
            """;

    static final String EMAIL_ALREADY_EXISTS = """
            {
              "type": "urn:qualitytrack:problem:email-already-exists",
              "title": "Conflicto",
              "status": 409,
              "detail": "El correo electrónico ya pertenece a una cuenta que no puede ser invitada.",
              "code": "EMAIL_ALREADY_EXISTS"
            }
            """;

    static final String INVALID_INTERNAL_INVITATION_TOKEN = """
            {
              "type": "urn:qualitytrack:problem:invalid-internal-invitation-token",
              "title": "Invitación interna inválida",
              "status": 400,
              "detail": "La invitación interna no es válida o ya fue utilizada.",
              "code": "INVALID_INTERNAL_INVITATION_TOKEN"
            }
            """;

    static final String INTERNAL_INVITATION_EXPIRED = """
            {
              "type": "urn:qualitytrack:problem:internal-invitation-expired",
              "title": "Invitación interna expirada",
              "status": 410,
              "detail": "La invitación interna ha expirado. Solicita al administrador que envíe una nueva.",
              "code": "INTERNAL_INVITATION_EXPIRED"
            }
            """;

    static final String DATA_CONFLICT = """
            {
              "type": "urn:qualitytrack:problem:data-conflict",
              "title": "Conflicto",
              "status": 409,
              "detail": "La cuenta interna no tiene roles asignados y no puede activarse.",
              "code": "DATA_CONFLICT"
            }
            """;

    static final String EMAIL_DELIVERY_FAILED = """
            {
              "type": "urn:qualitytrack:problem:email-delivery-failed",
              "title": "Servicio de correo no disponible",
              "status": 503,
              "detail": "No fue posible enviar el correo en este momento.",
              "code": "EMAIL_DELIVERY_FAILED"
            }
            """;

    private InternalUserApiExamples() {
    }
}
