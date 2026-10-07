package com.nocountry.qualitytrack.workorders.documentation;

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
        summary = "Consultar expediente 360 de una orden de trabajo",
        description = "Compone una vista de auditoría de solo lectura con origen comercial, revisiones de cotización, routing, producción, materiales, Calidad, no conformidades, documentos/versiones, entregas y timeline. Cada evento conserva un snapshot histórico inmutable de estados y metadata, y expone únicamente acciones navegables hacia recursos que siguen siendo válidos. Las acciones incluyen un type estable para que el frontend resuelva navegación sin depender del texto visible."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Expediente 360 consultado correctamente"),
        @ApiResponse(responseCode = "401", description = "La petición no contiene una autenticación válida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "El rol interno no permite consultar la orden", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "No existe la orden de trabajo indicada", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface GetWorkOrder360ApiDocs {
}
