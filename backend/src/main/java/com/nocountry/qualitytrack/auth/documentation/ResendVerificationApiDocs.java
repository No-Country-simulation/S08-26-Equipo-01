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
        summary = "Reenviar correo de verificación",
        description = "Solicita un nuevo enlace de verificación para una cuenta CUSTOMER que todavía esté PENDING_VERIFICATION. Si la cuenta cumple con esas condiciones, el token anterior se reemplaza por uno nuevo y se envía otro correo. La respuesta siempre es genérica, tanto si el correo existe como si no, para evitar que este endpoint pueda utilizarse para descubrir cuentas registradas."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "202",
                description = "Solicitud aceptada",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class),
                        examples = @ExampleObject(value = AuthApiExamples.VERIFICATION_EMAIL_SENT)
                )
        ),
        @ApiResponse(
                responseCode = "400",
                description = "Los datos de la solicitud no son válidos",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class)
                )
        ),
        @ApiResponse(
                responseCode = "503",
                description = "El servicio de correo no está disponible temporalmente",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class)
                )
        )
})
public @interface ResendVerificationApiDocs {
}
