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
        summary = "Consultar inspección de Calidad",
        description = "Devuelve la inspección, sus mediciones y la no conformidad asociada cuando exista."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Inspección consultada correctamente"),
        @ApiResponse(responseCode = "404", description = "No existe la inspección")
})
public @interface GetQualityInspectionApiDocs {
}
