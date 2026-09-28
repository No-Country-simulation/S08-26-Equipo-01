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
        summary = "Finalizar inspección",
        description = "Si todas las mediciones son PASS, la inspección queda APPROVED y la OT READY_FOR_DELIVERY. Si existe algún FAIL, queda REJECTED, la OT QUALITY_HOLD y se crea una NC OPEN en la misma transacción."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Inspección finalizada"),
        @ApiResponse(responseCode = "403", description = "Solo el inspector asignado o ADMIN puede finalizarla"),
        @ApiResponse(responseCode = "409", description = "No hay mediciones o el estado no permite finalizar")
})
public @interface CompleteQualityInspectionApiDocs {
}
