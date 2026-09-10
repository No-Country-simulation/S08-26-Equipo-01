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
        summary = "Restablecer contraseña",
        description = "Finaliza la recuperación de contraseña utilizando el token recibido por correo. El backend valida que el token exista, no haya expirado y siga asociado a una cuenta ACTIVE; después valida la nueva contraseña, la almacena de forma segura y consume el token para impedir su reutilización. Si el token es inválido, expiró o la cuenta dejó de estar disponible, la contraseña no se modifica."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Contraseña restablecida correctamente",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class),
                        examples = @ExampleObject(value = AuthApiExamples.PASSWORD_RESET_COMPLETED)
                )
        ),
        @ApiResponse(
                responseCode = "400",
                description = "Datos de solicitud o token de restablecimiento inválidos",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class),
                        examples = @ExampleObject(value = AuthApiExamples.INVALID_PASSWORD_RESET_TOKEN)
                )
        ),
        @ApiResponse(
                responseCode = "410",
                description = "El token para restablecer la contraseña ha expirado",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class),
                        examples = @ExampleObject(value = AuthApiExamples.PASSWORD_RESET_TOKEN_EXPIRED)
                )
        )
})
public @interface ResetPasswordApiDocs {
}
