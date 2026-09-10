package com.nocountry.qualitytrack.customers.documentation;

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
        summary = "Consultar una invitación",
        description = "Es el primer endpoint que puede utilizar el frontend cuando una persona abre el enlace recibido por correo. Valida que el token corresponda a una invitación PENDING y que todavía no haya expirado; si es válida, devuelve únicamente el nombre de la empresa, el rol ofrecido y la fecha de expiración para mostrar la pantalla de confirmación. Esta consulta no acepta la invitación, no consume el token y tampoco consulta ni revela si el correo invitado ya tiene una cuenta registrada. No requiere JWT porque el propio token identifica la invitación que se está revisando."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Invitación disponible",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class), examples = @ExampleObject(value = CustomerApiExamples.CUSTOMER_INVITATION_RESOLVED))
        ),
        @ApiResponse(
                responseCode = "400",
                description = "Token de invitación inválido o ya consumido",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.INVALID_CUSTOMER_INVITATION_TOKEN))
        ),
        @ApiResponse(
                responseCode = "410",
                description = "La invitación ha expirado",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.CUSTOMER_INVITATION_EXPIRED))
        )
})
public @interface ResolveCustomerInvitationApiDocs {
}
