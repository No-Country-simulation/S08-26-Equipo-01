package com.nocountry.qualitytrack.materials.documentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
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
@Operation(summary = "Listar materiales", description = "Lista el catálogo de materiales disponible para trazabilidad de Producción.")
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Materiales consultados correctamente"),
        @ApiResponse(responseCode = "403", description = "El rol no permite consultar información interna", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface ListMaterialsApiDocs {
}
