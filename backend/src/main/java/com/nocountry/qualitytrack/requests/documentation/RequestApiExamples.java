package com.nocountry.qualitytrack.requests.documentation;

final class RequestApiExamples {

    static final String CUSTOMER_REQUEST_SUBMITTED = """
            {
              "success": true,
              "code": "CUSTOMER_REQUEST_SUBMITTED",
              "message": "Solicitud enviada correctamente.",
              "data": {
                "id": 31,
                "customerId": 20,
                "requestNumber": "REQ-00000001",
                "customerReference": "OC-4587",
                "title": "Fabricación de eje de transmisión",
                "description": "Se requiere fabricar un eje conforme al plano proporcionado.",
                "quantity": 25,
                "materialRequirementType": "SPECIFIED",
                "materialRequirement": "AISI 4140",
                "requestedDeliveryDate": "2026-10-15",
                "requestedByUserId": 42,
                "requestedByName": "Ana López",
                "createdAt": "2026-09-10T10:00:00Z",
                "updatedAt": "2026-09-10T10:00:00Z",
                "jobCase": {
                  "id": 12,
                  "caseNumber": "CASE-00000001",
                  "status": "SUBMITTED",
                  "assignedToUserId": null,
                  "assignedAt": null,
                  "openedAt": "2026-09-10T10:00:00Z",
                  "cancelledByUserId": null,
                  "cancelledAt": null,
                  "cancellationReason": null
                }
              }
            }
            """;

    static final String CUSTOMER_REQUEST_RETRIEVED = """
            {
              "success": true,
              "code": "CUSTOMER_REQUEST_RETRIEVED",
              "message": "Solicitud consultada correctamente.",
              "data": {
                "id": 31,
                "customerId": 20,
                "requestNumber": "REQ-00000001",
                "customerReference": "OC-4587",
                "title": "Fabricación de eje de transmisión",
                "description": "Se requiere fabricar un eje conforme al plano proporcionado.",
                "quantity": 25,
                "materialRequirementType": "SPECIFIED",
                "materialRequirement": "AISI 4140",
                "requestedDeliveryDate": "2026-10-15",
                "requestedByUserId": 42,
                "requestedByName": "Ana López",
                "createdAt": "2026-09-10T10:00:00Z",
                "updatedAt": "2026-09-10T10:00:00Z",
                "jobCase": {
                  "id": 12,
                  "caseNumber": "CASE-00000001",
                  "status": "SUBMITTED",
                  "assignedToUserId": null,
                  "assignedAt": null,
                  "openedAt": "2026-09-10T10:00:00Z",
                  "cancelledByUserId": null,
                  "cancelledAt": null,
                  "cancellationReason": null
                },
                "documents": [
                  {
                    "id": 7,
                    "documentType": "DRAWING",
                    "name": "Plano de eje",
                    "description": "Plano recibido del cliente.",
                    "createdByUserId": 42,
                    "createdByName": "Ana López",
                    "createdAt": "2026-09-10T10:00:00Z",
                    "currentVersion": {
                      "id": 22,
                      "version": 2,
                      "fileName": "plano-eje-rev-b.pdf",
                      "mimeType": "application/pdf",
                      "fileSize": 251304,
                      "checksum": "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
                      "uploadedByUserId": 42,
                      "uploadedByName": "Ana López",
                      "uploadedAt": "2026-09-10T12:30:00Z",
                      "contentUrl": "/api/v1/customers/20/requests/31/documents/7/versions/22/content",
                      "downloadUrl": "/api/v1/customers/20/requests/31/documents/7/versions/22/content?download=true"
                    }
                  }
                ]
              }
            }
            """;

    static final String CUSTOMER_REQUESTS_RETRIEVED = """
            {
              "success": true,
              "code": "CUSTOMER_REQUESTS_RETRIEVED",
              "message": "Solicitudes consultadas correctamente.",
              "data": [
                {
                  "id": 31,
                  "customerId": 20,
                  "requestNumber": "REQ-00000001",
                  "customerReference": "OC-4587",
                  "title": "Fabricación de eje de transmisión",
                  "description": "Se requiere fabricar un eje conforme al plano proporcionado.",
                  "quantity": 25,
                  "materialRequirementType": "SPECIFIED",
                  "materialRequirement": "AISI 4140",
                  "requestedDeliveryDate": "2026-10-15",
                  "requestedByUserId": 42,
                  "requestedByName": "Ana López",
                  "createdAt": "2026-09-10T10:00:00Z",
                  "updatedAt": "2026-09-10T10:00:00Z",
                  "jobCase": {
                    "id": 12,
                    "caseNumber": "CASE-00000001",
                    "status": "SUBMITTED",
                    "assignedToUserId": null,
                    "assignedAt": null,
                    "openedAt": "2026-09-10T10:00:00Z",
                    "cancelledByUserId": null,
                    "cancelledAt": null,
                    "cancellationReason": null
                  }
                }
              ]
            }
            """;

    static final String CUSTOMER_REQUEST_CANCELLED = """
            {
              "success": true,
              "code": "CUSTOMER_REQUEST_CANCELLED",
              "message": "Solicitud cancelada correctamente.",
              "data": {
                "id": 31,
                "customerId": 20,
                "requestNumber": "REQ-00000001",
                "customerReference": "OC-4587",
                "title": "Fabricación de eje de transmisión",
                "description": "Se requiere fabricar un eje conforme al plano proporcionado.",
                "quantity": 25,
                "materialRequirementType": "SPECIFIED",
                "materialRequirement": "AISI 4140",
                "requestedDeliveryDate": "2026-10-15",
                "requestedByUserId": 42,
                "requestedByName": "Ana López",
                "createdAt": "2026-09-10T10:00:00Z",
                "updatedAt": "2026-09-10T10:00:00Z",
                "jobCase": {
                  "id": 12,
                  "caseNumber": "CASE-00000001",
                  "status": "CANCELLED",
                  "assignedToUserId": null,
                  "assignedAt": null,
                  "openedAt": "2026-09-10T10:00:00Z",
                  "cancelledByUserId": 42,
                  "cancelledAt": "2026-09-10T14:45:00Z",
                  "cancellationReason": "El cliente ya no requiere la fabricación."
                }
              }
            }
            """;

    static final String JOB_CASE_RETRIEVED = """
            {
              "success": true,
              "code": "JOB_CASE_RETRIEVED",
              "message": "Expediente consultado correctamente.",
              "data": {
                "id": 12,
                "caseNumber": "CASE-00000001",
                "status": "SUBMITTED",
                "assignedToUserId": null,
                "assignedToName": null,
                "assignedAt": null,
                "openedAt": "2026-09-10T10:00:00Z",
                "closedAt": null,
                "cancelledByUserId": null,
                "cancelledByName": null,
                "cancelledAt": null,
                "cancellationReason": null,
                "request": {
                  "id": 31,
                  "customerId": 20,
                  "customerName": "Mecanizados del Pacífico",
                  "requestNumber": "REQ-00000001",
                  "customerReference": "OC-4587",
                  "title": "Fabricación de eje de transmisión",
                  "description": "Se requiere fabricar un eje conforme al plano proporcionado.",
                  "quantity": 25,
                  "materialRequirementType": "SPECIFIED",
                  "materialRequirement": "AISI 4140",
                  "requestedDeliveryDate": "2026-10-15",
                  "requestedByUserId": 42,
                  "requestedByName": "Ana López",
                  "submittedAt": "2026-09-10T10:00:00Z"
                },
                "documents": [
                  {
                    "id": 7,
                    "documentType": "DRAWING",
                    "name": "Plano de eje",
                    "description": "Plano recibido del cliente.",
                    "createdByUserId": 42,
                    "createdByName": "Ana López",
                    "createdAt": "2026-09-10T10:00:00Z",
                    "currentVersion": {
                      "id": 22,
                      "version": 2,
                      "fileName": "plano-eje-rev-b.pdf",
                      "mimeType": "application/pdf",
                      "fileSize": 251304,
                      "checksum": "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
                      "uploadedByUserId": 42,
                      "uploadedByName": "Ana López",
                      "uploadedAt": "2026-09-10T12:30:00Z",
                      "contentUrl": "/api/v1/customers/20/requests/31/documents/7/versions/22/content",
                      "downloadUrl": "/api/v1/customers/20/requests/31/documents/7/versions/22/content?download=true"
                    }
                  }
                ]
              }
            }
            """;

    static final String JOB_CASES_RETRIEVED = """
            {
              "success": true,
              "code": "JOB_CASES_RETRIEVED",
              "message": "Expedientes consultados correctamente.",
              "data": [
                {
                  "id": 12,
                  "caseNumber": "CASE-00000001",
                  "status": "SUBMITTED",
                  "assignedToUserId": null,
                  "assignedToName": null,
                  "assignedAt": null,
                  "openedAt": "2026-09-10T10:00:00Z",
                  "closedAt": null,
                  "cancelledByUserId": null,
                  "cancelledByName": null,
                  "cancelledAt": null,
                  "cancellationReason": null,
                  "request": {
                    "id": 31,
                    "customerId": 20,
                    "customerName": "Mecanizados del Pacífico",
                    "requestNumber": "REQ-00000001",
                    "customerReference": "OC-4587",
                    "title": "Fabricación de eje de transmisión",
                    "description": "Se requiere fabricar un eje conforme al plano proporcionado.",
                    "quantity": 25,
                    "materialRequirementType": "SPECIFIED",
                    "materialRequirement": "AISI 4140",
                    "requestedDeliveryDate": "2026-10-15",
                    "requestedByUserId": 42,
                    "requestedByName": "Ana López",
                    "submittedAt": "2026-09-10T10:00:00Z"
                  }
                }
              ]
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

    static final String CUSTOMER_REQUEST_CANNOT_BE_CANCELLED = """
            {
              "type": "urn:qualitytrack:problem:customer-request-cannot-be-cancelled",
              "title": "Solicitud no cancelable",
              "status": 409,
              "detail": "La solicitud no puede cancelarse en su estado actual.",
              "code": "CUSTOMER_REQUEST_CANNOT_BE_CANCELLED"
            }
            """;

    private RequestApiExamples() {
    }
}
