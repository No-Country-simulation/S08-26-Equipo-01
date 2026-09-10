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
        name = "05 · Expedientes",
        description = "Consulta interna de expedientes asociados a solicitudes de cliente."
)
public @interface JobCaseApiDocs {
}
