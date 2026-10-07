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
        summary = "Cancelar orden de trabajo",
        description = "Cancela únicamente una WorkOrder en CREATED. En el modelo actual la cancelación es terminal: la WorkOrder pasa a CANCELLED y el JobCase también queda CANCELLED. Como la relación es 1 JobCase → 1 WorkOrder, el expediente no puede recibir una orden de reemplazo después de esta acción."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Orden de trabajo cancelada correctamente"),
        @ApiResponse(responseCode = "401", description = "La petición no contiene una autenticación válida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "El rol interno no permite gestionar órdenes de trabajo", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "No existe la orden de trabajo indicada", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "409", description = "La orden no está en CREATED o el expediente ya no puede cancelarse desde producción", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface CancelWorkOrderApiDocs {
}
