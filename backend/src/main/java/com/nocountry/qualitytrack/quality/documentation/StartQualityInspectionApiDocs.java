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
        summary = "Iniciar inspección",
        description = "Cambia PENDING a IN_PROGRESS, asigna inspector y registra startedAt. Si inspectorId se omite, se utiliza el usuario QUALITY autenticado."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Inspección iniciada correctamente"),
        @ApiResponse(responseCode = "403", description = "El rol no permite gestionar Calidad"),
        @ApiResponse(responseCode = "409", description = "La inspección u OT no están en el estado esperado")
})
public @interface StartQualityInspectionApiDocs {
}
