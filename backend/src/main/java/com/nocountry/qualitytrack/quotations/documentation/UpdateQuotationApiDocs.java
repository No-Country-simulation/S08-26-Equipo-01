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
        summary = "Actualizar borrador de cotización",
        description = "Reemplaza los datos comerciales y la colección completa de conceptos de una revisión DRAFT. Un concepto existente se actualiza enviando su id; un concepto nuevo omite el id y un concepto existente que ya no se envía se elimina. El backend valida que cada id pertenezca a la cotización y recalcula subtotal, impuesto y total; una revisión enviada nunca puede volver a editarse."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Borrador actualizado y totales recalculados", content = @Content(mediaType = "application/json", schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class), examples = @ExampleObject(value = QuotationApiExamples.QUOTATION_UPDATED))),
        @ApiResponse(responseCode = "401", description = "La petición no contiene una autenticación válida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "El usuario no es responsable del expediente ni ADMIN", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "No existe la cotización indicada", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "409", description = "La revisión ya no está en DRAFT, un concepto no pertenece a la cotización o un importe excede el máximo permitido", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = QuotationApiExamples.DATA_CONFLICT)))
})
public @interface UpdateQuotationApiDocs {
}
