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
        summary = "Actualizar empresa cliente",
        description = "Actualiza los datos generales de una empresa sin reemplazar el registro completo. La operación está reservada a miembros ACTIVE con rol ADMIN de esa empresa. Como es una actualización parcial, los campos que no se envían conservan su valor actual; los campos opcionales enviados en blanco se limpian, mientras que el nombre de la empresa no puede quedar vacío. Esta operación no modifica miembros, roles ni invitaciones."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Empresa actualizada correctamente",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class), examples = @ExampleObject(value = CustomerApiExamples.CUSTOMER_UPDATED))
        ),
        @ApiResponse(
                responseCode = "400",
                description = "La solicitud no contiene cambios válidos",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.VALIDATION_ERROR))
        ),
        @ApiResponse(
                responseCode = "401",
                description = "Autenticación requerida",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.AUTHENTICATION_REQUIRED))
        ),
        @ApiResponse(
                responseCode = "403",
                description = "El usuario no es ADMIN activo de la empresa",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.ACCESS_DENIED))
        ),
        @ApiResponse(
                responseCode = "404",
                description = "Empresa no encontrada",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.RESOURCE_NOT_FOUND))
        )
})
public @interface UpdateCustomerApiDocs {
}
