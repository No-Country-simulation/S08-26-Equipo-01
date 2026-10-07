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
        summary = "Consultar detalle de una orden de trabajo",
        description = "Devuelve la orden junto con prioridad, fechas planeadas, fecha comprometida, contexto operativo del expediente, referencia exacta a la revisión de cotización aprobada y las versiones de documentos fijadas a la OT. Los documentos disponibles del expediente y los documentos fijados se distinguen para no confundir la última versión con la versión autorizada para fabricación. No expone precios, impuestos ni totales comerciales."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Orden de trabajo consultada correctamente"),
        @ApiResponse(responseCode = "401", description = "La petición no contiene una autenticación válida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "El rol interno no permite consultar órdenes de trabajo", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "No existe la orden de trabajo indicada", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface GetWorkOrderApiDocs {
}
