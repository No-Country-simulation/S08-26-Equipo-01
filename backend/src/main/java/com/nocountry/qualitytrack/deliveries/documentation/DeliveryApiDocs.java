package com.nocountry.qualitytrack.deliveries.documentation;

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
        name = "13 · Entregas",
        description = "Preparación, despacho, registro logístico de recepción real, evidencia documental, entregas parciales y cierre de la orden de trabajo."
)
public @interface DeliveryApiDocs {
}
