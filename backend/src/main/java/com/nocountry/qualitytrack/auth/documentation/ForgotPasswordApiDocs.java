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
        summary = "Solicitar restablecimiento de contraseña",
        description = "Inicia el proceso de recuperación de contraseña a partir de un correo electrónico. Si existe una cuenta ACTIVE asociada, se genera un token temporal de un solo uso y se envía un enlace para establecer una nueva contraseña; si ya había un token de recuperación, se reemplaza por el nuevo. La respuesta es siempre genérica, incluso cuando el correo no existe o la cuenta no está ACTIVE, para evitar revelar qué cuentas están registradas."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "202",
                description = "Solicitud aceptada",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class),
                        examples = @ExampleObject(value = AuthApiExamples.PASSWORD_RESET_EMAIL_SENT)
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
public @interface ForgotPasswordApiDocs {
}
