package com.nocountry.qualitytrack.quality.documentation;

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
        summary = "Enviar una OT a Calidad",
        description = "Requiere producción completa. Crea una QualityInspection PENDING y cambia la WorkOrder de IN_PRODUCTION a QUALITY_PENDING en la misma transacción."
)
@ApiResponses({
        @ApiResponse(responseCode = "201", description = "Handoff realizado correctamente"),
        @ApiResponse(responseCode = "403", description = "El rol no permite gestionar Producción", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "No existe la orden", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "409", description = "La producción no está completa o la OT no está en el estado esperado", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface QualityHandoffApiDocs {
}
