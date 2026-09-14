package com.nocountry.qualitytrack.users.documentation;

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
        summary = "Aceptar una invitación interna",
        description = "Completa el onboarding del usuario interno. El backend vuelve a validar el token, lo bloquea para evitar aceptaciones concurrentes y verifica que la cuenta siga siendo INTERNAL, continúe en PENDING_ACTIVATION y conserve al menos un rol asignado. Si todo es válido, cifra la contraseña elegida por la persona, activa la cuenta y elimina el token de invitación en la misma transacción. A partir de ese momento la cuenta queda ACTIVE y puede iniciar sesión con los roles previamente definidos por el administrador. No requiere JWT porque la persona todavía no dispone de una sesión autenticada."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Cuenta interna activada correctamente",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class), examples = @ExampleObject(value = InternalUserApiExamples.INTERNAL_INVITATION_ACCEPTED))
        ),
        @ApiResponse(
                responseCode = "400",
                description = "La contraseña no cumple las reglas o el token es inválido, ya fue utilizado o ya no corresponde a una cuenta pendiente",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class),
                        examples = {
                                @ExampleObject(name = "Datos inválidos", value = InternalUserApiExamples.VALIDATION_ERROR),
                                @ExampleObject(name = "Token inválido", value = InternalUserApiExamples.INVALID_INTERNAL_INVITATION_TOKEN)
                        }
                )
        ),
        @ApiResponse(
                responseCode = "409",
                description = "La cuenta interna no conserva roles asignados y no puede activarse",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = InternalUserApiExamples.DATA_CONFLICT))
        ),
        @ApiResponse(
                responseCode = "410",
                description = "La invitación interna ha expirado",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = InternalUserApiExamples.INTERNAL_INVITATION_EXPIRED))
        )
})
public @interface AcceptInternalUserInvitationApiDocs {
}
