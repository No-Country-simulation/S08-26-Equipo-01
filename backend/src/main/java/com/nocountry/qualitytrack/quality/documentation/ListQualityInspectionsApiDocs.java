package com.nocountry.qualitytrack.quality.documentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Operation(
        summary = "Listar inspecciones de una OT",
        description = "Devuelve todas las inspecciones históricas de la WorkOrder, incluidas inspecciones rechazadas que no se sobrescriben."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Inspecciones consultadas correctamente"),
        @ApiResponse(responseCode = "404", description = "No existe la orden de trabajo")
})
public @interface ListQualityInspectionsApiDocs {
}
