package com.nocountry.qualitytrack.customers.documentation;

final class CustomerApiExamples {

    static final String CUSTOMER_CREATED = """
            {
              "success": true,
              "code": "CUSTOMER_CREATED",
              "message": "Empresa creada correctamente.",
              "data": {
                "id": 20,
                "name": "Mecanizados del Pacífico",
                "rfc": "MAP010101ABC",
                "phone": "+52 311 123 4567",
                "administrativeEmail": "administracion@empresa.com",
                "city": "Tepic",
                "state": "Nayarit",
                "website": "https://empresa.com",
                "status": "ACTIVE",
                "createdAt": "2026-09-10T06:30:00Z"
              }
            }
            """;

    static final String CUSTOMER_RETRIEVED = """
            {
              "success": true,
              "code": "CUSTOMER_RETRIEVED",
              "message": "Empresa consultada correctamente.",
              "data": {
                "id": 20,
                "name": "Mecanizados del Pacífico",
                "rfc": "MAP010101ABC",
                "phone": "+52 311 123 4567",
                "administrativeEmail": "administracion@empresa.com",
                "city": "Tepic",
                "state": "Nayarit",
                "website": "https://empresa.com",
                "status": "ACTIVE",
                "createdAt": "2026-09-10T06:30:00Z"
              }
            }
            """;

    static final String CUSTOMER_UPDATED = """
            {
              "success": true,
              "code": "CUSTOMER_UPDATED",
              "message": "Empresa actualizada correctamente.",
              "data": {
                "id": 20,
                "name": "Mecanizados del Pacífico SA de CV",
                "rfc": "MAP010101ABC",
                "phone": "+52 311 123 4567",
                "administrativeEmail": "administracion@empresa.com",
                "city": "Tepic",
                "state": "Nayarit",
                "website": "https://empresa.com",
                "status": "ACTIVE",
                "createdAt": "2026-09-10T06:30:00Z"
              }
            }
            """;

    static final String CUSTOMER_MEMBERS_RETRIEVED = """
            {
              "success": true,
              "code": "CUSTOMER_MEMBERS_RETRIEVED",
              "message": "Miembros de la empresa consultados correctamente.",
              "data": [
                {
                  "membershipId": 7,
                  "userId": 42,
                  "firstName": "Ana",
                  "lastName": "López",
                  "email": "ana@empresa.com",
                  "role": "ADMIN",
                  "status": "ACTIVE",
                  "joinedAt": "2026-09-10T06:30:00Z",
                  "createdAt": "2026-09-10T06:30:00Z"
                }
              ]
            }
            """;

    static final String CUSTOMER_INVITATION_CREATED = """
            {
              "success": true,
              "code": "CUSTOMER_INVITATION_CREATED",
              "message": "Invitación enviada correctamente.",
              "data": {
                "id": 12,
                "customerId": 20,
                "email": "diego@empresa.com",
                "role": "REQUESTER",
                "status": "PENDING",
                "expiresAt": "2026-09-13T06:30:00Z",
                "createdAt": "2026-09-10T06:30:00Z"
              }
            }
            """;

    static final String CUSTOMER_INVITATIONS_RETRIEVED = """
            {
              "success": true,
              "code": "CUSTOMER_INVITATIONS_RETRIEVED",
              "message": "Invitaciones pendientes consultadas correctamente.",
              "data": [
                {
                  "id": 12,
                  "customerId": 20,
                  "email": "diego@empresa.com",
                  "role": "REQUESTER",
                  "status": "PENDING",
                  "expiresAt": "2026-09-13T06:30:00Z",
                  "createdAt": "2026-09-10T06:30:00Z"
                }
              ]
            }
            """;

    static final String CUSTOMER_INVITATION_RESOLVED = """
            {
              "success": true,
              "code": "CUSTOMER_INVITATION_RESOLVED",
              "message": "Invitación disponible.",
              "data": {
                "customerName": "Mecanizados del Pacífico",
                "role": "REQUESTER",
                "expiresAt": "2026-09-13T06:30:00Z"
              }
            }
            """;

    static final String CUSTOMER_INVITATION_REGISTRATION_REQUIRED = """
            {
              "success": true,
              "code": "CUSTOMER_INVITATION_REGISTRATION_REQUIRED",
              "message": "Completa tus datos para crear la cuenta y finalizar la invitación.",
              "data": {
                "outcome": "REGISTRATION_REQUIRED",
                "customerName": "Mecanizados del Pacífico",
                "role": "REQUESTER"
              }
            }
            """;

    static final String CUSTOMER_INVITATION_ACCEPTED = """
            {
              "success": true,
              "code": "CUSTOMER_INVITATION_ACCEPTED",
              "message": "Invitación aceptada correctamente. Ya puedes iniciar sesión.",
              "data": {
                "outcome": "ACCEPTED",
                "customerName": "Mecanizados del Pacífico",
                "role": "REQUESTER"
              }
            }
            """;

    static final String CUSTOMER_INVITATION_REGISTRATION_COMPLETED = """
            {
              "success": true,
              "code": "CUSTOMER_INVITATION_REGISTRATION_COMPLETED",
              "message": "Cuenta creada e invitación aceptada correctamente. Ya puedes iniciar sesión.",
              "data": {
                "outcome": "ACCEPTED",
                "customerName": "Mecanizados del Pacífico",
                "role": "REQUESTER"
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
              "detail": "No tienes permisos para realizar esta acción.",
              "code": "ACCESS_DENIED"
            }
            """;

    static final String RESOURCE_NOT_FOUND = """
            {
              "type": "urn:qualitytrack:problem:resource-not-found",
              "title": "Recurso no encontrado",
              "status": 404,
              "detail": "No se encontró el recurso solicitado.",
              "code": "RESOURCE_NOT_FOUND"
            }
            """;

    static final String DATA_CONFLICT = """
            {
              "type": "urn:qualitytrack:problem:data-conflict",
              "title": "Conflicto",
              "status": 409,
              "detail": "El estado actual del recurso no permite completar la operación.",
              "code": "DATA_CONFLICT"
            }
            """;

    static final String INVALID_CUSTOMER_INVITATION_TOKEN = """
            {
              "type": "urn:qualitytrack:problem:invalid-customer-invitation-token",
              "title": "Invitación inválida",
              "status": 400,
              "detail": "La invitación no es válida o ya no está disponible.",
              "code": "INVALID_CUSTOMER_INVITATION_TOKEN"
            }
            """;

    static final String CUSTOMER_INVITATION_EXPIRED = """
            {
              "type": "urn:qualitytrack:problem:customer-invitation-expired",
              "title": "Invitación expirada",
              "status": 410,
              "detail": "La invitación ha expirado.",
              "code": "CUSTOMER_INVITATION_EXPIRED"
            }
            """;

    static final String EMAIL_DELIVERY_FAILED = """
            {
              "type": "urn:qualitytrack:problem:email-delivery-failed",
              "title": "Servicio de correo no disponible",
              "status": 503,
              "detail": "El servicio de correo no está disponible temporalmente.",
              "code": "EMAIL_DELIVERY_FAILED"
            }
            """;

    private CustomerApiExamples() {
    }
}
