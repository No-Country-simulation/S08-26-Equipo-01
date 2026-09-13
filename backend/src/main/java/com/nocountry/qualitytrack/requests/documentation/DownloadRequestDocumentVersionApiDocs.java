package com.nocountry.qualitytrack.requests.documentation;

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
        summary = "Ver o descargar una versión de un documento",
        description = "Entrega exactamente la versión indicada dentro de la solicitud. Por defecto permite vista previa inline únicamente para tipos seguros soportados (PDF, JPEG, PNG, WEBP, GIF y texto plano); otros tipos se fuerzan como descarga. Con download=true siempre usa Content-Disposition attachment. El backend valida la cadena solicitud, expediente, documento y versión antes de resolver el archivo en almacenamiento. Esta ruta está protegida por JWT: contentUrl y downloadUrl son rutas de API autenticadas, no enlaces públicos. Un frontend con Bearer token debe solicitar el contenido como binario/blob mediante su cliente HTTP autenticado y, si necesita abrirlo en el navegador, crear una URL local temporal con URL.createObjectURL."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Archivo entregado correctamente"),
        @ApiResponse(responseCode = "401", description = "Autenticación requerida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "El usuario no puede consultar el documento", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "No se encontró la solicitud, el documento activo o la versión dentro de ese contexto", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "503", description = "El archivo no está disponible en almacenamiento", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface DownloadRequestDocumentVersionApiDocs {
}
