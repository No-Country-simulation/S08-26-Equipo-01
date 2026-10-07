package com.nocountry.qualitytrack.customers.documentation;

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
        summary = "Listar miembros activos de una empresa",
        description = "Devuelve las personas que actualmente tienen acceso a la empresa mediante una membresía ACTIVE. Cualquier miembro ACTIVE de la misma empresa puede consultar esta lista, independientemente de su rol. Las invitaciones que todavía no han sido aceptadas no aparecen aquí porque aún no son membresías; se consultan mediante el endpoint de invitaciones pendientes. Los miembros retirados tampoco se muestran, aunque su historial de membresía se conserva."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Miembros activos consultados correctamente",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class), examples = @ExampleObject(value = CustomerApiExamples.CUSTOMER_MEMBERS_RETRIEVED))
        ),
        @ApiResponse(
                responseCode = "401",
                description = "Autenticación requerida",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.AUTHENTICATION_REQUIRED))
        ),
        @ApiResponse(
                responseCode = "403",
                description = "El usuario no pertenece activamente a la empresa",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.ACCESS_DENIED))
        )
})
public @interface ListCustomerMembersApiDocs {
}
