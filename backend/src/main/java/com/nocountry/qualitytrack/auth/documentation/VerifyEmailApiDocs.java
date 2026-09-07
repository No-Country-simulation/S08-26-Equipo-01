package com.nocountry.qualitytrack.auth.documentation;

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
        summary = "Verificar correo electrónico",
        description = "Consume un token de verificación de un solo uso y activa la cuenta CUSTOMER cuando cumple con los requisitos."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Correo electrónico verificado correctamente",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class),
                        examples = @ExampleObject(value = AuthApiExamples.EMAIL_VERIFIED)
                )
        ),
        @ApiResponse(
                responseCode = "400",
                description = "Token inválido o verificación no disponible para la cuenta",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class),
                        examples = @ExampleObject(value = AuthApiExamples.INVALID_VERIFICATION_TOKEN)
                )
        ),
        @ApiResponse(
                responseCode = "410",
                description = "El token de verificación ha expirado",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class),
                        examples = @ExampleObject(value = AuthApiExamples.VERIFICATION_TOKEN_EXPIRED)
                )
        )
})
public @interface VerifyEmailApiDocs {
}
