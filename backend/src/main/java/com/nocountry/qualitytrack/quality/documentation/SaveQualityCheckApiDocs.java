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
        summary = "Registrar o corregir control de calidad",
        description = "Admite controles NUMERIC_RANGE con PASS/FAIL calculado por backend y controles PASS_FAIL con resultado explícito. Solo pueden modificarse mientras la inspección esté IN_PROGRESS."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Control actualizado correctamente"),
        @ApiResponse(responseCode = "201", description = "Control creado correctamente"),
        @ApiResponse(responseCode = "403", description = "Solo el inspector asignado o ADMIN puede modificarlo"),
        @ApiResponse(responseCode = "409", description = "Datos o estado incompatibles")
})
public @interface SaveQualityCheckApiDocs {
}
