package com.nocountry.qualitytrack.production.documentation;

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
        summary = "Iniciar ejecución de una operación",
        description = "Crea una OperationExecution IN_PROGRESS para una operación habilitada de un RoutingSheet RELEASED. En PRODUCTION, la primera ejecución mueve la WorkOrder de READY_FOR_PRODUCTION a IN_PRODUCTION. En REWORK, la primera ejecución mueve QUALITY_HOLD a REWORK_IN_PROGRESS. Si se asigna una máquina, cambia de AVAILABLE a IN_USE. startNotes es opcional."
)
@ApiResponses({
        @ApiResponse(responseCode = "201", description = "Ejecución iniciada correctamente"),
        @ApiResponse(responseCode = "400", description = "Solicitud inválida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "401", description = "Autenticación requerida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "El rol no permite operar Producción", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "No existe la operación, operador o máquina indicada", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "409", description = "La operación no está habilitada, ya fue completada o la máquina no está disponible", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface StartOperationExecutionApiDocs {
}
