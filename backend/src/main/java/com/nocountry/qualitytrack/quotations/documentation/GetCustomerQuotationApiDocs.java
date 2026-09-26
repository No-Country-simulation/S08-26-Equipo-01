package com.nocountry.qualitytrack.quotations.documentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
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
        summary = "Consultar detalle de una cotización como cliente",
        description = "Devuelve únicamente una revisión que haya sido enviada al cliente, con sus conceptos, importes, vigencia y entrega estimada. Las revisiones nunca enviadas permanecen internas aunque después sean canceladas. customerStatus representa el estado público. Si hubo una solicitud de ajuste, adjustment agrupa notes y response; durante una nueva negociación response permanece null para no mezclar respuestas de revisiones anteriores."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Cotización consultada correctamente"),
        @ApiResponse(responseCode = "401", description = "La petición no contiene una autenticación válida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "El usuario no pertenece a la empresa indicada", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "La cotización no existe, pertenece a otra empresa o todavía está en DRAFT", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface GetCustomerQuotationApiDocs {
}
