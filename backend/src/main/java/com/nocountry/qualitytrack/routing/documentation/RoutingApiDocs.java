package com.nocountry.qualitytrack.routing.documentation;

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
        name = "09 · Hoja de ruta",
        description = "Diseño y liberación de rutas PRODUCTION y REWORK de una WorkOrder. Routing define qué debe hacerse y en qué orden; máquina, operador y tiempos reales pertenecen a OperationExecution. Las rutas REWORK son revisiones nuevas ligadas a una no conformidad."
)
public @interface RoutingApiDocs {
}
