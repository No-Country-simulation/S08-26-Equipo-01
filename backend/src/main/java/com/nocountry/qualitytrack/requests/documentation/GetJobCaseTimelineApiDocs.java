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
        summary = "Consultar historial del expediente",
        description = "Devuelve los eventos de negocio del expediente del más reciente al más antiguo mediante paginación por cursor. El parámetro limit admite de 1 a 50 elementos y cursor permite continuar desde la página anterior sin depender de offsets. Cada evento puede incluir usuario, transición de estado y metadata de contexto. Es una consulta de solo lectura y solo los usuarios internos con acceso a expedientes pueden consultarla."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Página del historial del expediente consultada correctamente",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class)
                )
        ),
        @ApiResponse(
                responseCode = "400",
                description = "El límite está fuera del rango permitido o el cursor no es válido",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class)
                )
        ),
        @ApiResponse(
                responseCode = "401",
                description = "La petición no contiene una autenticación válida",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class),
                        examples = @ExampleObject(value = RequestApiExamples.AUTHENTICATION_REQUIRED)
                )
        ),
        @ApiResponse(
                responseCode = "403",
                description = "La cuenta no es INTERNAL o no posee un rol con acceso al historial del expediente",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class),
                        examples = @ExampleObject(value = RequestApiExamples.ACCESS_DENIED)
                )
        ),
        @ApiResponse(
                responseCode = "404",
                description = "No existe un expediente con el identificador indicado",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class),
                        examples = @ExampleObject(value = RequestApiExamples.RESOURCE_NOT_FOUND)
                )
        )
})
public @interface GetJobCaseTimelineApiDocs {
}
