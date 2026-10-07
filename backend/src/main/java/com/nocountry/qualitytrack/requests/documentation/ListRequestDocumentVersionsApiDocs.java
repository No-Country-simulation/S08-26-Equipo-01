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
        summary = "Consultar historial de versiones de un documento",
        description = "Devuelve todas las versiones del documento indicado dentro de la solicitud, ordenadas desde la primera hasta la más reciente. El backend valida que el documento pertenezca al expediente de la solicitud antes de consultar su historial."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Historial consultado correctamente", content = @Content(mediaType = "application/json", schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class), examples = @ExampleObject(value = RequestDocumentApiExamples.DOCUMENT_VERSIONS_RETRIEVED))),
        @ApiResponse(responseCode = "401", description = "Autenticación requerida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "El usuario no puede consultar el documento", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "No se encontró la solicitud o el documento dentro de ella", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface ListRequestDocumentVersionsApiDocs {
}
