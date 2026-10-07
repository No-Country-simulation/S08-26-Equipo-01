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
        summary = "Consultar una invitación interna",
        description = "Es el endpoint que utiliza el frontend cuando la persona abre el enlace de invitación recibido por correo. Valida que el token siga vigente y corresponda a una cuenta INTERNAL en estado PENDING_ACTIVATION; si es válido, devuelve nombre, apellido, correo, roles asignados y fecha de expiración para construir la pantalla previa a la activación. Esta operación es solo de consulta: no establece contraseña, no activa la cuenta y no consume el token. No requiere JWT porque el propio token de invitación identifica la cuenta pendiente que se está revisando."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Invitación interna disponible",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class), examples = @ExampleObject(value = InternalUserApiExamples.INTERNAL_INVITATION_RESOLVED))
        ),
        @ApiResponse(
                responseCode = "400",
                description = "Token de invitación inválido, ya utilizado o asociado a una cuenta que ya no está pendiente",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = InternalUserApiExamples.INVALID_INTERNAL_INVITATION_TOKEN))
        ),
        @ApiResponse(
                responseCode = "410",
                description = "La invitación interna ha expirado",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = InternalUserApiExamples.INTERNAL_INVITATION_EXPIRED))
        )
})
public @interface ResolveInternalUserInvitationApiDocs {
}
