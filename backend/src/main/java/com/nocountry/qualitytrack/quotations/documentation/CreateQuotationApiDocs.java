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
        summary = "Crear cotización para un expediente",
        description = "Crea la revisión 1 en DRAFT para un JobCase READY_FOR_QUOTATION. Solo el COMMERCIAL responsable o un ADMIN pueden iniciar el flujo; crearla no modifica el estado del expediente y un mismo expediente no puede iniciar dos flujos de cotización. El borrador nace en MXN con una tasa de impuesto predeterminada de 16%, que puede cambiarse a 0% o a una tasa personalizada mientras la revisión continúe en DRAFT."
)
@ApiResponses({
        @ApiResponse(responseCode = "201", description = "Cotización DRAFT creada correctamente", content = @Content(mediaType = "application/json", schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class), examples = @ExampleObject(value = QuotationApiExamples.QUOTATION_CREATED))),
        @ApiResponse(responseCode = "401", description = "La petición no contiene una autenticación válida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = QuotationApiExamples.AUTHENTICATION_REQUIRED))),
        @ApiResponse(responseCode = "403", description = "El usuario no puede gestionar la cotización de este expediente", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = QuotationApiExamples.ACCESS_DENIED))),
        @ApiResponse(responseCode = "404", description = "No existe el expediente indicado", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = QuotationApiExamples.RESOURCE_NOT_FOUND))),
        @ApiResponse(responseCode = "409", description = "El expediente no está listo para cotizar o ya tiene un flujo de cotización", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = QuotationApiExamples.DATA_CONFLICT)))
})
public @interface CreateQuotationApiDocs {
}
