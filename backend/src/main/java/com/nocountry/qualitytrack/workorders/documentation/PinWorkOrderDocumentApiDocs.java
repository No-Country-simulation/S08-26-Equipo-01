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
        summary = "Fijar versión de documento para una orden de trabajo",
        description = "Vincula una versión concreta de un documento del mismo expediente a la WorkOrder. Volver a fijar el mismo documento reemplaza la versión seleccionada mientras la orden continúe en CREATED y no exista un routing actualmente APPROVED o RELEASED. Una reapertura explícita a DRAFT permite corregir el paquete antes de volver a aprobar. La referencia no sigue automáticamente versiones posteriores del documento."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Versión del documento fijada correctamente"),
        @ApiResponse(responseCode = "401", description = "La petición no contiene una autenticación válida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "El rol interno no permite preparar órdenes de trabajo", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "No existe la orden, documento o versión indicados", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "409", description = "La orden ya no se encuentra en CREATED o su hoja de ruta ya fue aprobada", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface PinWorkOrderDocumentApiDocs {
}
