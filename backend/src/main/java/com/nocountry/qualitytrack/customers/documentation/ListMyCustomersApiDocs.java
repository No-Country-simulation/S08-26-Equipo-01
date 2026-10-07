package com.nocountry.qualitytrack.customers.documentation;

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
@Operation(
        summary = "Consultar mis empresas cliente",
        description = "Lista las empresas en las que el usuario autenticado conserva una membresía ACTIVE. Devuelve el customerId necesario para entrar al contexto de cada empresa junto con el rol de membresía del usuario. No mezcla roles internos con roles de cliente."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Empresas del usuario consultadas correctamente"
        ),
        @ApiResponse(
                responseCode = "401",
                description = "Autenticación requerida",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class)
                )
        )
})
public @interface ListMyCustomersApiDocs {
}
