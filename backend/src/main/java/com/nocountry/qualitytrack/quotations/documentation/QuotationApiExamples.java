package com.nocountry.qualitytrack.quotations.documentation;

final class QuotationApiExamples {

    private QuotationApiExamples() {
    }

    static final String QUOTATION_CREATED = """
            {
              "code": "QUOTATION_CREATED",
              "message": "Cotización creada correctamente.",
              "data": {
                "id": 21,
                "caseId": 12,
                "caseNumber": "CASE-00000012",
                "quotationNumber": "QT-00000001",
                "revision": 1,
                "status": "DRAFT",
                "currency": "MXN",
                "subtotal": 0.00,
                "taxRate": 16.0000,
                "tax": 0.00,
                "total": 0.00,
                "items": []
              }
            }
            """;

    static final String QUOTATION_UPDATED = """
            {
              "code": "QUOTATION_UPDATED",
              "message": "Cotización actualizada correctamente.",
              "data": {
                "id": 21,
                "quotationNumber": "QT-00000001",
                "revision": 1,
                "status": "DRAFT",
                "currency": "MXN",
                "subtotal": 2500.00,
                "taxRate": 16.0000,
                "tax": 400.00,
                "total": 2900.00,
                "validUntil": "2026-10-15",
                "estimatedDeliveryDate": "2026-10-30",
                "items": [
                  {
                    "id": 81,
                    "lineNumber": 1,
                    "description": "Mecanizado de eje",
                    "quantity": 2.00,
                    "unitPrice": 1000.00,
                    "subtotal": 2000.00
                  },
                  {
                    "id": 82,
                    "lineNumber": 2,
                    "description": "Inspección dimensional",
                    "quantity": 1.00,
                    "unitPrice": 500.00,
                    "subtotal": 500.00
                  }
                ]
              }
            }
            """;

    static final String QUOTATION_SENT = """
            {
              "code": "QUOTATION_SENT",
              "message": "Cotización enviada al cliente correctamente.",
              "data": {
                "id": 21,
                "quotationNumber": "QT-00000001",
                "revision": 2,
                "status": "SENT",
                "total": 2900.00,
                "validUntil": "2026-10-15",
                "adjustmentNotes": "Reducir el plazo de entrega.",
                "adjustmentResponse": "Podemos reducir el plazo a 20 días manteniendo el precio propuesto."
              }
            }
            """;

    static final String QUOTATION_APPROVED = """
            {
              "code": "QUOTATION_APPROVED",
              "message": "Cotización aprobada correctamente.",
              "data": {
                "id": 21,
                "quotationNumber": "QT-00000001",
                "revision": 1,
                "customerStatus": "APPROVED",
                "total": 2900.00
              }
            }
            """;

    static final String ADJUSTMENT_REQUESTED = """
            {
              "code": "QUOTATION_ADJUSTMENT_REQUESTED",
              "message": "Solicitud de ajuste registrada correctamente.",
              "data": {
                "id": 21,
                "quotationNumber": "QT-00000001",
                "revision": 1,
                "customerStatus": "ADJUSTMENT_REQUESTED",
                "adjustment": {
                  "notes": "Reducir el plazo de entrega.",
                  "response": null
                }
              }
            }
            """;

    static final String AUTHENTICATION_REQUIRED = """
            {
              "type": "about:blank",
              "title": "Authentication required",
              "status": 401,
              "detail": "Se requiere autenticación para acceder a este recurso."
            }
            """;

    static final String ACCESS_DENIED = """
            {
              "type": "about:blank",
              "title": "Access denied",
              "status": 403,
              "detail": "No tienes permisos para realizar esta operación."
            }
            """;

    static final String RESOURCE_NOT_FOUND = """
            {
              "type": "about:blank",
              "title": "Resource not found",
              "status": 404,
              "detail": "No se encontró la cotización."
            }
            """;

    static final String DATA_CONFLICT = """
            {
              "type": "about:blank",
              "title": "Data conflict",
              "status": 409,
              "detail": "La operación no es válida para el estado actual de la cotización."
            }
            """;
}
