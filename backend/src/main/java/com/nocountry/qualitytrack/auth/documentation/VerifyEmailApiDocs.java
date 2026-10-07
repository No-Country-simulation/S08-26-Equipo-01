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
        summary = "Verificar correo electrónico",
        description = "Finaliza la activación de una cuenta CUSTOMER registrada de forma normal. El backend valida que el token exista, no haya expirado y corresponda a una cuenta que todavía esté PENDING_VERIFICATION. Si todo es correcto, la cuenta pasa a ACTIVE y el token se consume para que no pueda reutilizarse. A partir de ese momento el usuario ya puede iniciar sesión con sus credenciales."
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
