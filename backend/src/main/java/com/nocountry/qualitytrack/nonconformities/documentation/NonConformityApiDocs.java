package com.nocountry.qualitytrack.nonconformities.documentation;

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
        name = "12 · No conformidades y retrabajo",
        description = "Gestión de desviaciones, REWORK, SCRAP, USE_AS_IS, trazabilidad y resolución."
)
public @interface NonConformityApiDocs {
}
