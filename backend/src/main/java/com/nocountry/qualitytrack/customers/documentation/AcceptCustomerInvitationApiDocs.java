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
        summary = "Aceptar una invitación",
        description = "Se utiliza cuando la persona confirma que desea unirse a la empresa. El backend vuelve a validar que la invitación siga PENDING y vigente y, a partir del correo fijado en esa invitación, determina si ya existe una cuenta CUSTOMER disponible. Si la cuenta existe, crea o reactiva su membresía como ACTIVE con el rol invitado y marca la invitación como ACCEPTED; desde ese momento el usuario puede iniciar sesión cuando lo desee. Si todavía no existe una cuenta, no crea la membresía ni consume la invitación: responde REGISTRATION_REQUIRED para que el frontend solicite los datos básicos y continúe con complete-registration. No requiere JWT y el cliente nunca indica qué usuario debe recibir la membresía."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Invitación aceptada o registro requerido",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class),
                        examples = {
                                @ExampleObject(name = "Cuenta existente", value = CustomerApiExamples.CUSTOMER_INVITATION_ACCEPTED),
                                @ExampleObject(name = "Registro requerido", value = CustomerApiExamples.CUSTOMER_INVITATION_REGISTRATION_REQUIRED)
                        }
                )
        ),
        @ApiResponse(
                responseCode = "400",
                description = "Token de invitación inválido o ya consumido",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.INVALID_CUSTOMER_INVITATION_TOKEN))
        ),
        @ApiResponse(
                responseCode = "409",
                description = "La cuenta o membresía asociada no permite completar la aceptación",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.DATA_CONFLICT))
        ),
        @ApiResponse(
                responseCode = "410",
                description = "La invitación ha expirado",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.CUSTOMER_INVITATION_EXPIRED))
        )
})
public @interface AcceptCustomerInvitationApiDocs {
}
