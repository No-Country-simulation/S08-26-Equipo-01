package com.nocountry.qualitytrack.quotations.documentation;

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
        name = "07 · Cotizaciones",
        description = "Gestión del flujo comercial, revisiones y respuesta del cliente."
)
public @interface QuotationApiDocs {
}
