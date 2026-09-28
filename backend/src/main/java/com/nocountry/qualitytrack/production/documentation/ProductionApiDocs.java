package com.nocountry.qualitytrack.production.documentation;

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
        name = "10 · Producción",
        description = "Ejecución real de las operaciones definidas en un RoutingSheet RELEASED. Registra operador, máquina, tiempos y cantidades sin mezclar ejecución con planeación ni aprobación de Calidad."
)
public @interface ProductionApiDocs {
}
