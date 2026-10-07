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
        summary = "Listar órdenes de trabajo",
        description = "Lista las órdenes de trabajo para usuarios internos autorizados. Incluye expediente, cliente, cantidad solicitada, estado operativo, prioridad, planificación, fecha comprometida y la revisión de cotización aprobada que originó cada OT."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Órdenes de trabajo consultadas correctamente"),
        @ApiResponse(responseCode = "401", description = "La petición no contiene una autenticación válida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "El rol interno no permite consultar órdenes de trabajo", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface ListWorkOrdersApiDocs {
}
