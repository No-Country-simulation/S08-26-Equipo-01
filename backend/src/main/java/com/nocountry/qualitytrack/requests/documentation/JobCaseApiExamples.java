package com.nocountry.qualitytrack.requests.documentation;

final class JobCaseApiExamples {

    static final String JOB_CASE_REVIEW_STARTED = """
            {
              "success": true,
              "code": "JOB_CASE_REVIEW_STARTED",
              "message": "Expediente tomado. La revisión ha iniciado correctamente.",
              "data": {
                "id": 12,
                "caseNumber": "CASE-00000001",
                "status": "UNDER_REVIEW",
                "assignedToUserId": 10,
                "assignedToName": "Carlos Ruiz",
                "assignedAt": "2026-09-14T12:30:00Z",
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
            }
            """;

    static final String CREATE_INFORMATION_REQUEST = """
            {
              "question": "¿Puede confirmar si la tolerancia de ±0.02 mm aplica a todos los asientos?"
            }
            """;

    static final String INFORMATION_REQUEST_CREATED = """
            {
              "success": true,
              "code": "JOB_CASE_INFORMATION_REQUESTED",
              "message": "Información solicitada al cliente correctamente.",
              "data": {
                "id": 7,
                "question": "¿Puede confirmar si la tolerancia de ±0.02 mm aplica a todos los asientos?",
                "requestedByUserId": 10,
                "requestedByName": "Carlos Ruiz",
                "requestedAt": "2026-09-14T12:45:00Z",
                "response": null,
                "respondedByUserId": null,
                "respondedByName": null,
                "respondedAt": null,
                "open": true
              }
            }
            """;

    static final String RESPOND_INFORMATION_REQUEST = """
            {
              "response": "La tolerancia de ±0.02 mm aplica únicamente a los asientos indicados en el plano."
            }
            """;

    static final String INFORMATION_REQUEST_RESPONDED = """
            {
              "success": true,
              "code": "CUSTOMER_INFORMATION_RESPONDED",
              "message": "Información enviada correctamente.",
              "data": {
                "id": 7,
                "question": "¿Puede confirmar si la tolerancia de ±0.02 mm aplica a todos los asientos?",
                "requestedByName": "Carlos Ruiz",
                "requestedAt": "2026-09-14T12:45:00Z",
                "response": "La tolerancia de ±0.02 mm aplica únicamente a los asientos indicados en el plano.",
                "respondedByName": "Ana López",
                "respondedAt": "2026-09-14T13:20:00Z",
                "open": false
              }
            }
            """;

    static final String DEFINE_MATERIAL_SPECIFICATION = """
            {
              "materialName": "Acero AISI 4140",
              "standardOrGrade": "ASTM A29",
              "technicalNotes": "Material recomendado para la carga y condiciones de operación indicadas."
            }
            """;

    static final String MATERIAL_SPECIFICATION_SAVED = """
            {
              "success": true,
              "code": "JOB_CASE_MATERIAL_SPECIFICATION_SAVED",
              "message": "Especificación técnica guardada correctamente.",
              "data": {
                "id": 5,
                "materialName": "Acero AISI 4140",
                "standardOrGrade": "ASTM A29",
                "technicalNotes": "Material recomendado para la carga y condiciones de operación indicadas.",
                "definedByUserId": 18,
                "definedByName": "Laura Méndez",
                "definedAt": "2026-09-14T13:40:00Z"
              }
            }
            """;

    static final String JOB_CASE_READY_FOR_QUOTATION = """
            {
              "success": true,
              "code": "JOB_CASE_READY_FOR_QUOTATION",
              "message": "Revisión completada. El expediente está listo para cotización.",
              "data": {
                "id": 12,
                "caseNumber": "CASE-00000001",
                "status": "READY_FOR_QUOTATION",
                "assignedToUserId": 10,
                "assignedToName": "Carlos Ruiz",
                "assignedAt": "2026-09-14T12:30:00Z",
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
            }
            """;

    static final String DATA_CONFLICT = """
            {
              "type": "urn:qualitytrack:problem:data-conflict",
              "title": "Conflicto",
              "status": 409,
              "detail": "La operación no puede realizarse en el estado actual del expediente.",
              "code": "DATA_CONFLICT"
            }
            """;

    private JobCaseApiExamples() {
    }
}
