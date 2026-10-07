package com.nocountry.qualitytrack.materials.documentation;

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
        name = "10 · Producción · Materiales",
        description = "Catálogo, lotes y consumo real de material por WorkOrder. El alcance es trazabilidad de fabricación, no inventario ERP."
)
public @interface MaterialApiDocs {
}
