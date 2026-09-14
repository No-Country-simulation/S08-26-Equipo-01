package com.nocountry.qualitytrack.requests.documentation;

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
        summary = "Consultar trazabilidad del expediente",
        description = "Devuelve en orden cronológico los eventos de negocio registrados para un JobCase. La trazabilidad es de solo lectura desde la API: los eventos se generan internamente cuando ocurren operaciones como crear la solicitud, adjuntar documentos, agregar versiones o cancelar el expediente. En esta etapa pueden consultarla cuentas INTERNAL con rol ADMIN, COMMERCIAL, ENGINEERING o AUDITOR."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Trazabilidad del expediente consultada correctamente",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class)
                )
        ),
        @ApiResponse(
                responseCode = "401",
                description = "Autenticación requerida",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class),
                        examples = @ExampleObject(value = RequestApiExamples.AUTHENTICATION_REQUIRED)
                )
        ),
        @ApiResponse(
                responseCode = "403",
                description = "La cuenta o el rol interno no permiten consultar la trazabilidad",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class),
                        examples = @ExampleObject(value = RequestApiExamples.ACCESS_DENIED)
                )
        ),
        @ApiResponse(
                responseCode = "404",
                description = "No se encontró el expediente",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class),
                        examples = @ExampleObject(value = RequestApiExamples.RESOURCE_NOT_FOUND)
                )
        )
})
public @interface GetJobCaseTimelineApiDocs {
}
