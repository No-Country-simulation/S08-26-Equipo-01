package com.nocountry.qualitytrack.customers.documentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
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
        summary = "Consultar empresa cliente",
        description = "Consulta los datos generales de una empresa a la que pertenece el usuario autenticado. Antes de devolver la información, se comprueba que el usuario conserve una membresía ACTIVE en esa empresa; tener un JWT válido por sí solo no concede acceso. Si el usuario fue retirado de la empresa, puede seguir teniendo una cuenta válida, pero este recurso dejará de estar disponible para él."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Empresa consultada correctamente",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class), examples = @ExampleObject(value = CustomerApiExamples.CUSTOMER_RETRIEVED))
        ),
        @ApiResponse(
                responseCode = "401",
                description = "Autenticación requerida",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.AUTHENTICATION_REQUIRED))
        ),
        @ApiResponse(
                responseCode = "403",
                description = "El usuario no pertenece activamente a la empresa",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.ACCESS_DENIED))
        ),
        @ApiResponse(
                responseCode = "404",
                description = "Empresa no encontrada",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.RESOURCE_NOT_FOUND))
        )
})
public @interface GetCustomerApiDocs {
}
