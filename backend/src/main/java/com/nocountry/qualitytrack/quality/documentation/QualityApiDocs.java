package com.nocountry.qualitytrack.quality.documentation;

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
        name = "11 · Calidad",
        description = "Handoff desde Producción, inspecciones formales, controles numéricos o PASS/FAIL y apertura atómica de no conformidades ante un rechazo."
)
public @interface QualityApiDocs {
}
