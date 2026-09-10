package com.nocountry.qualitytrack.requests.documentation;

import io.swagger.v3.oas.annotations.tags.Tag;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Tag(
        name = "04 · Solicitudes de cliente",
        description = "Gestión de solicitudes enviadas por empresas cliente."
)
public @interface CustomerRequestApiDocs {
}
