package com.nocountry.qualitytrack.quotations.documentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.ProblemDetail;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Operation(
        summary = "Solicitar ajuste de cotización",
        description = "Permite a un ADMIN o REQUESTER de la empresa solicitar cambios sobre una revisión SENT vigente. Internamente la revisión recibida queda SUPERSEDED y el sistema crea la siguiente revisión como DRAFT copiando sus datos y conceptos para que el equipo comercial la ajuste. El contrato del cliente no expone estados técnicos: devuelve customerStatus=ADJUSTMENT_REQUESTED y adjustment con las notas solicitadas y response=null mientras la nueva revisión siga interna."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Solicitud registrada y revisión anterior marcada SUPERSEDED", content = @Content(mediaType = "application/json", schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class), examples = @ExampleObject(value = QuotationApiExamples.ADJUSTMENT_REQUESTED))),
        @ApiResponse(responseCode = "401", description = "La petición no contiene una autenticación válida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "El usuario no puede solicitar ajustes para esta empresa", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "La cotización no existe o pertenece a otra empresa", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "409", description = "La revisión no está SENT o ya venció", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = QuotationApiExamples.DATA_CONFLICT)))
})
public @interface RequestQuotationAdjustmentApiDocs {
}
