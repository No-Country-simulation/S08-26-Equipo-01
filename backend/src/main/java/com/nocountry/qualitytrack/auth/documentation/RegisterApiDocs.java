package com.nocountry.qualitytrack.auth.documentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import org.springframework.http.ProblemDetail;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@SecurityRequirements
@Operation(
        summary = "Registrar cuenta de cliente",
        description = "Crea una cuenta de tipo CUSTOMER con los datos proporcionados. El correo se normaliza y debe ser único; si el registro es válido, la cuenta queda en estado PENDING_VERIFICATION y se envía un enlace de verificación al correo indicado. Mientras no se complete esa verificación, el usuario todavía no puede iniciar sesión. Este endpoint crea únicamente la cuenta de usuario: no crea una empresa ni una membresía."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "201",
                description = "Cliente registrado correctamente",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class),
                        examples = @ExampleObject(value = AuthApiExamples.REGISTER_SUCCESS)
                )
        ),
        @ApiResponse(
                responseCode = "400",
                description = "Los datos de registro no son válidos",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class),
                        examples = @ExampleObject(value = AuthApiExamples.VALIDATION_ERROR)
                )
        ),
        @ApiResponse(
                responseCode = "409",
                description = "El correo electrónico ya está registrado",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class),
                        examples = @ExampleObject(value = AuthApiExamples.EMAIL_ALREADY_EXISTS)
                )
        ),
        @ApiResponse(
                responseCode = "503",
                description = "El servicio de correo no está disponible temporalmente",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class),
                        examples = @ExampleObject(value = AuthApiExamples.EMAIL_DELIVERY_FAILED)
                )
        )
})
public @interface RegisterApiDocs {
}
