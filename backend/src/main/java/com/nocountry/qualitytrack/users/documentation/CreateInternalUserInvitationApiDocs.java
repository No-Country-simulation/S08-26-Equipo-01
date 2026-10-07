package com.nocountry.qualitytrack.users.documentation;

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
        summary = "Invitar un usuario interno",
        description = "Inicia el onboarding de una cuenta interna. Solo un ADMIN interno activo puede indicar nombre, apellido, correo y uno o varios roles del sistema. El backend crea la cuenta en estado PENDING_ACTIVATION o reutiliza una invitación interna todavía pendiente para ese mismo correo, reemplaza sus roles por los enviados en esta solicitud, genera un token de activación de un solo uso y envía el enlace por correo. La cuenta todavía no puede iniciar sesión: queda activada únicamente cuando la persona completa correctamente el endpoint de aceptación y establece su contraseña."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "201",
                description = "Invitación interna creada o renovada correctamente",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class), examples = @ExampleObject(value = InternalUserApiExamples.INTERNAL_INVITATION_CREATED))
        ),
        @ApiResponse(
                responseCode = "400",
                description = "Los datos de la invitación no son válidos",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = InternalUserApiExamples.VALIDATION_ERROR))
        ),
        @ApiResponse(
                responseCode = "401",
                description = "Autenticación requerida",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = InternalUserApiExamples.AUTHENTICATION_REQUIRED))
        ),
        @ApiResponse(
                responseCode = "403",
                description = "El usuario autenticado no es un ADMIN interno activo",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = InternalUserApiExamples.ACCESS_DENIED))
        ),
        @ApiResponse(
                responseCode = "409",
                description = "El correo ya pertenece a una cuenta que no puede ser invitada",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = InternalUserApiExamples.EMAIL_ALREADY_EXISTS))
        ),
        @ApiResponse(
                responseCode = "503",
                description = "El servicio de correo no está disponible temporalmente",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = InternalUserApiExamples.EMAIL_DELIVERY_FAILED))
        )
})
public @interface CreateInternalUserInvitationApiDocs {
}
