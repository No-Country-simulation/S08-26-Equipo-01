package com.nocountry.qualitytrack.requests.documentation;

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
        summary = "Enviar solicitud de cliente",
        description = "Envía una nueva solicitud para una empresa en la que el usuario tenga una membresía ACTIVE con rol ADMIN o REQUESTER. La solicitud representa lo que el cliente necesita y no persiste como borrador. Al enviarse, el backend crea en la misma transacción la CustomerRequest y su JobCase 1:1 en estado SUBMITTED y todavía sin responsable. La fecha solicitada es una preferencia del cliente y no un compromiso de entrega."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "201",
                description = "Solicitud y expediente creados correctamente",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class),
                        examples = @ExampleObject(value = RequestApiExamples.CUSTOMER_REQUEST_SUBMITTED)
                )
        ),
        @ApiResponse(
                responseCode = "400",
                description = "Los datos de la solicitud no son válidos",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.VALIDATION_ERROR))
        ),
        @ApiResponse(
                responseCode = "401",
                description = "Autenticación requerida",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.AUTHENTICATION_REQUIRED))
        ),
        @ApiResponse(
                responseCode = "403",
                description = "Sin membresía activa, rol suficiente o empresa disponible para recibir solicitudes",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.ACCESS_DENIED))
        )
})
public @interface SubmitCustomerRequestApiDocs {
}
