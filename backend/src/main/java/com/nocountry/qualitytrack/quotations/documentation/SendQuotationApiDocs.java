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
        summary = "Enviar cotización al cliente",
        description = "Valida que la revisión DRAFT tenga conceptos, vigencia y fecha estimada de entrega antes de cambiarla a SENT. Si la revisión nació de una solicitud de ajuste del cliente, adjustmentResponse es obligatoria y se envía junto con la nueva cotización; puede explicar qué se aceptó, qué no fue posible y la alternativa propuesta. En una cotización inicial el body puede omitirse. A partir del envío la revisión queda congelada."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Cotización enviada y revisión congelada", content = @Content(mediaType = "application/json", schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class), examples = @ExampleObject(value = QuotationApiExamples.QUOTATION_SENT))),
        @ApiResponse(responseCode = "401", description = "La petición no contiene una autenticación válida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "El usuario no puede enviar esta cotización", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "No existe la cotización indicada", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "409", description = "La revisión no está en DRAFT, está incompleta o falta la respuesta obligatoria a una solicitud de ajuste", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = QuotationApiExamples.DATA_CONFLICT)))
})
public @interface SendQuotationApiDocs {
}
