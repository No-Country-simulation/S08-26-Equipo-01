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
        summary = "Crear empresa cliente",
        description = "Crea una nueva empresa para la cuenta CUSTOMER autenticada. Cuando la operación termina correctamente, la empresa queda ACTIVE y el usuario que la creó se registra automáticamente como su primer miembro con rol ADMIN y membresía ACTIVE, por lo que puede comenzar a administrarla sin una operación adicional. Una cuenta INTERNAL no puede crear empresas mediante este endpoint."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "201",
                description = "Empresa creada correctamente",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class),
                        examples = @ExampleObject(value = CustomerApiExamples.CUSTOMER_CREATED)
                )
        ),
        @ApiResponse(
                responseCode = "400",
                description = "Los datos de la empresa no son válidos",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.VALIDATION_ERROR))
        ),
        @ApiResponse(
                responseCode = "401",
                description = "Autenticación requerida",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.AUTHENTICATION_REQUIRED))
        ),
        @ApiResponse(
                responseCode = "403",
                description = "La cuenta autenticada no es de tipo CUSTOMER",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.ACCESS_DENIED))
        )
})
public @interface CreateCustomerApiDocs {
}
