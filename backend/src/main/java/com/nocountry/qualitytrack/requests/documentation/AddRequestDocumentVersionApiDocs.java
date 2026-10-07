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
        summary = "Agregar versión a un documento de una solicitud",
        description = "Agrega una nueva versión al documento indicado dentro de la solicitud sin modificar versiones anteriores. El backend valida que el documento pertenezca realmente al expediente asociado a esa solicitud y lo bloquea durante la operación para evitar números de versión duplicados por concurrencia."
)
@ApiResponses({
        @ApiResponse(responseCode = "201", description = "Nueva versión creada correctamente", content = @Content(mediaType = "application/json", schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class), examples = @ExampleObject(value = RequestDocumentApiExamples.DOCUMENT_VERSION_CREATED))),
        @ApiResponse(responseCode = "400", description = "Archivo inválido", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "401", description = "Autenticación requerida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "El usuario no puede agregar versiones", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "No se encontró la solicitud o el documento dentro de ella", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "409", description = "El estado del expediente no admite la operación", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "413", description = "El archivo supera el tamaño máximo permitido", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "503", description = "El almacenamiento de documentos no está disponible", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface AddRequestDocumentVersionApiDocs {
}
