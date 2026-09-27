package com.nocountry.qualitytrack.routing.documentation;

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
        summary = "Reabrir hoja de ruta aprobada",
        description = "Devuelve una RoutingSheet APPROVED a DRAFT antes de su liberación para corregir operaciones o documentos fijados. Requiere motivo, conserva el hecho de la aprobación previa en trazabilidad y solo está disponible para ADMIN o ENGINEERING. Una ruta RELEASED nunca se reabre."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Hoja de ruta reabierta correctamente"),
        @ApiResponse(responseCode = "401", description = "La petición no contiene una autenticación válida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "El rol interno no permite reabrir hojas de ruta", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "No existe la hoja de ruta indicada", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "409", description = "La hoja de ruta no está APPROVED o la orden ya no está en CREATED", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface ReopenRoutingSheetApiDocs {
}
