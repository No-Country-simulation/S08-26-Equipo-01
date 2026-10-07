package com.nocountry.qualitytrack.requests.documentation;

import com.nocountry.qualitytrack.requests.dto.request.SubmitCustomerRequestForm;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.MediaType;
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
        description = "Envía una nueva solicitud como multipart/form-data. Cada elemento de documents representa un documento completo y agrupa documentType, name, description y file. La metadata es opcional: si documentType se omite se usa REQUEST_ATTACHMENT y si name se omite se usa el nombre original del archivo. El backend crea CustomerRequest y su JobCase 1:1 y después crea los documentos asociados dentro de la misma transacción de aplicación. Los clientes multipart deben usar nombres anidados como documents[0].documentType y documents[0].file. Swagger UI puede no renderizar como selector de archivo un MultipartFile anidado dentro de un arreglo, pero el contrato HTTP y el binding de Spring sí soportan esa estructura. Requiere membresía ACTIVE con rol ADMIN o REQUESTER.",
        requestBody = @RequestBody(
                required = true,
                content = @Content(
                        mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                        schema = @Schema(implementation = SubmitCustomerRequestForm.class)
                )
        )
)
@ApiResponses({
        @ApiResponse(
                responseCode = "201",
                description = "Solicitud, expediente y documentos iniciales creados correctamente",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class),
                        examples = @ExampleObject(value = RequestApiExamples.CUSTOMER_REQUEST_SUBMITTED)
                )
        ),
        @ApiResponse(
                responseCode = "400",
                description = "Los datos de la solicitud, la metadata o alguno de los archivos no son válidos",
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
        ),
        @ApiResponse(
                responseCode = "413",
                description = "Uno de los archivos o la petición multipart supera el límite configurado",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        ),
        @ApiResponse(
                responseCode = "503",
                description = "El almacenamiento de documentos no está disponible",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        )
})
public @interface SubmitCustomerRequestApiDocs {
}
