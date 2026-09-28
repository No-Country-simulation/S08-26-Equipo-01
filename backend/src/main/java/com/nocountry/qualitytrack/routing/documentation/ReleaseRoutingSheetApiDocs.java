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
        summary = "Liberar hoja de ruta",
        description = "Libera una ruta APPROVED. Para PRODUCTION cambia RoutingSheet a RELEASED y WorkOrder CREATED a READY_FOR_PRODUCTION en la misma transacción. Para REWORK libera la nueva revisión ligada a una NC OPEN con disposición REWORK y mantiene la WorkOrder en QUALITY_HOLD hasta que inicie la primera ejecución. Requiere documentos fijados y operaciones."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Operación completada correctamente"),
        @ApiResponse(responseCode = "401", description = "La petición no contiene una autenticación válida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "El rol interno no permite realizar esta operación", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "No existe el recurso indicado", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "409", description = "La ruta o la OT no cumplen los prerrequisitos de liberación", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface ReleaseRoutingSheetApiDocs {
}
