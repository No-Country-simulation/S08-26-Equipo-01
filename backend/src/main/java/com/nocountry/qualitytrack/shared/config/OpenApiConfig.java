package com.nocountry.qualitytrack.shared.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    public static final String BEARER_AUTH = "bearerAuth";

    @Bean
    OpenAPI qualityTrackOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("QualityTrack API")
                        .version("v1")
                        .description("API REST para autenticación, trazabilidad industrial, producción y control de calidad."))
                .components(new Components()
                        .addSecuritySchemes(
                                BEARER_AUTH,
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Token JWT de acceso obtenido mediante el endpoint de autenticación.")
                        ));
    }
}
