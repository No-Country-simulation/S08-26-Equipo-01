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
        summary = "Completar ejecución",
        description = "Finaliza una OperationExecution IN_PROGRESS registrando cantidades procesadas, aceptadas y rechazadas. quantityProcessed debe ser igual a quantityAccepted + quantityRejected. completionNotes es opcional y se almacena separada de la nota de inicio. Libera la máquina asignada y, si era la última operación pendiente, marca la producción como completa sin enviar todavía la OT a Calidad."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Ejecución completada correctamente"),
        @ApiResponse(responseCode = "400", description = "Cantidades o datos inválidos", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "401", description = "Autenticación requerida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "El rol no permite operar Producción", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "No existe la ejecución", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "409", description = "La ejecución o la OT no están en un estado compatible", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface CompleteOperationExecutionApiDocs {
}
