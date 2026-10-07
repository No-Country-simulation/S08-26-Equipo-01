package com.nocountry.qualitytrack.materials.documentation;

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
        summary = "Registrar consumo real de material",
        description = "Acumula consumo por WorkOrder + MaterialLot durante IN_PRODUCTION. No permite consumir más de la cantidad recibida del lote ni registrar consumo después de completar producción."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Consumo registrado correctamente"),
        @ApiResponse(responseCode = "400", description = "Cantidad inválida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "OT o lote no encontrado", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "409", description = "La OT no está en producción o el lote no tiene cantidad suficiente", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface RecordMaterialConsumptionApiDocs {
}
