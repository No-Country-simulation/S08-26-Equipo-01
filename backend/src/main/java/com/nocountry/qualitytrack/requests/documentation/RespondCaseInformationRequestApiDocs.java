package com.nocountry.qualitytrack.requests.documentation;

import com.nocountry.qualitytrack.requests.dto.request.RespondCaseInformationRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
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
        summary = "Responder una aclaración solicitada por el equipo interno",
        description = "Permite a un miembro ACTIVE de la empresa con rol ADMIN o REQUESTER responder una aclaración abierta solicitada por el equipo interno. La respuesta queda asociada a esa pregunta y, si el expediente continúa en WAITING_CUSTOMER_INFO, el backend lo devuelve automáticamente a UNDER_REVIEW para que pueda continuar la revisión. El cliente no envía ni decide el estado interno del expediente. Cada aclaración solo puede responderse una vez.",
        requestBody = @RequestBody(
                required = true,
                description = "Respuesta del cliente a la pregunta concreta realizada por el equipo interno.",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = RespondCaseInformationRequest.class),
                        examples = @ExampleObject(value = JobCaseApiExamples.RESPOND_INFORMATION_REQUEST)
                )
        )
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "La aclaración quedó respondida y el expediente volvió a UNDER_REVIEW",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class),
                        examples = @ExampleObject(value = JobCaseApiExamples.INFORMATION_REQUEST_RESPONDED)
                )
        ),
        @ApiResponse(
                responseCode = "400",
                description = "La respuesta está vacía o supera el máximo permitido",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.VALIDATION_ERROR))
        ),
        @ApiResponse(
                responseCode = "401",
                description = "La petición no contiene una autenticación válida",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.AUTHENTICATION_REQUIRED))
        ),
        @ApiResponse(
                responseCode = "403",
                description = "El usuario no posee una membresía ACTIVE con rol ADMIN/REQUESTER en la empresa indicada",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.ACCESS_DENIED))
        ),
        @ApiResponse(
                responseCode = "404",
                description = "La CustomerRequest no pertenece a la empresa indicada o la solicitud de información no pertenece a ese expediente",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.RESOURCE_NOT_FOUND))
        ),
        @ApiResponse(
                responseCode = "409",
                description = "El expediente ya no espera información del cliente o la aclaración indicada ya no está abierta",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = JobCaseApiExamples.DATA_CONFLICT))
        )
})
public @interface RespondCaseInformationRequestApiDocs {
}
