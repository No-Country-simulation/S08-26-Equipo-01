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
        summary = "Completar registro desde una invitación",
        description = "Completa el flujo cuando accept respondió REGISTRATION_REQUIRED porque el correo invitado todavía no tenía una cuenta. El frontend solo solicita nombre, apellido y contraseña; el correo, la empresa y el rol no se reciben del cliente, sino que se recuperan de la invitación para evitar que puedan modificarse. Si el token sigue válido y el correo continúa disponible, se crea una cuenta CUSTOMER ya ACTIVE, se registra la membresía ACTIVE con el rol de la invitación y la invitación pasa a ACCEPTED en la misma operación. El propio token sirve como prueba de acceso al correo invitado, por lo que esta cuenta no necesita una verificación de correo adicional. Si la operación no puede completarse, la invitación no debe quedar aceptada a medias."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "201",
                description = "Cuenta creada e invitación aceptada correctamente",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class), examples = @ExampleObject(value = CustomerApiExamples.CUSTOMER_INVITATION_REGISTRATION_COMPLETED))
        ),
        @ApiResponse(
                responseCode = "400",
                description = "Token inválido, ya consumido o datos de registro no válidos",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class),
                        examples = {
                                @ExampleObject(name = "Token inválido", value = CustomerApiExamples.INVALID_CUSTOMER_INVITATION_TOKEN),
                                @ExampleObject(name = "Validación", value = CustomerApiExamples.VALIDATION_ERROR)
                        }
                )
        ),
        @ApiResponse(
                responseCode = "409",
                description = "Ya existe una cuenta asociada al correo invitado",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.DATA_CONFLICT))
        ),
        @ApiResponse(
                responseCode = "410",
                description = "La invitación ha expirado",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.CUSTOMER_INVITATION_EXPIRED))
        )
})
public @interface CompleteCustomerInvitationRegistrationApiDocs {
}
