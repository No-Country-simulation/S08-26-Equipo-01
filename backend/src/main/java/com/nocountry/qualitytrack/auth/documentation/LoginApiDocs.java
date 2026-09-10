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
        summary = "Autenticar usuario",
        description = "Valida el correo y la contraseña de una cuenta que esté habilitada para iniciar sesión. Si las credenciales son correctas y la cuenta está ACTIVE, devuelve un token JWT que el frontend debe enviar como Bearer en los endpoints protegidos. El token confirma la identidad del usuario, pero no concede por sí solo acceso a una empresa concreta: las operaciones de empresa siguen comprobando que exista una membresía ACTIVE para ese usuario. Las cuentas pendientes de verificación o suspendidas no pueden autenticarse."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Autenticación exitosa",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class),
                        examples = @ExampleObject(value = AuthApiExamples.AUTHENTICATED)
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
                responseCode = "401",
                description = "Credenciales inválidas o cuenta no activa",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class),
                        examples = @ExampleObject(value = AuthApiExamples.INVALID_CREDENTIALS)
                )
        )
})
public @interface LoginApiDocs {
}
