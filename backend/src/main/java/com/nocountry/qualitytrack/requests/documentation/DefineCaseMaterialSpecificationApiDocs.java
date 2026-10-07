package com.nocountry.qualitytrack.requests.documentation;

import com.nocountry.qualitytrack.requests.dto.request.DefineCaseMaterialSpecificationRequest;
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
        summary = "Definir o actualizar la especificación técnica del material",
        description = "Permite a ENGINEERING o ADMIN dejar definida la especificación técnica del material mientras el expediente está en UNDER_REVIEW. Existe una sola especificación por expediente: si todavía no existe se crea y, si ya existe, se actualiza con los valores enviados. Es obligatoria antes de completar la revisión cuando la solicitud usa ASSISTANCE_REQUIRED; con SPECIFIED es opcional y puede utilizarse para precisar técnicamente lo indicado por el cliente. Guardarla no cambia el estado del expediente.",
        requestBody = @RequestBody(
                required = true,
                description = "Definición técnica vigente del material para el expediente. materialName es obligatorio; norma/grado y notas técnicas son opcionales.",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = DefineCaseMaterialSpecificationRequest.class),
                        examples = @ExampleObject(value = JobCaseApiExamples.DEFINE_MATERIAL_SPECIFICATION)
                )
        )
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Especificación técnica creada o actualizada correctamente; el expediente continúa en UNDER_REVIEW",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class),
                        examples = @ExampleObject(value = JobCaseApiExamples.MATERIAL_SPECIFICATION_SAVED)
                )
        ),
        @ApiResponse(
                responseCode = "400",
                description = "El material está vacío o alguno de los campos supera la longitud permitida",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.VALIDATION_ERROR))
        ),
        @ApiResponse(
                responseCode = "401",
                description = "La petición no contiene una autenticación válida",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.AUTHENTICATION_REQUIRED))
        ),
        @ApiResponse(
                responseCode = "403",
                description = "La cuenta no es INTERNAL o no posee rol ENGINEERING/ADMIN",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.ACCESS_DENIED))
        ),
        @ApiResponse(
                responseCode = "404",
                description = "No existe un expediente con el identificador indicado",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.RESOURCE_NOT_FOUND))
        ),
        @ApiResponse(
                responseCode = "409",
                description = "El expediente no está en UNDER_REVIEW y por lo tanto su especificación técnica ya no puede modificarse desde este flujo",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = JobCaseApiExamples.DATA_CONFLICT))
        )
})
public @interface DefineCaseMaterialSpecificationApiDocs {
}
