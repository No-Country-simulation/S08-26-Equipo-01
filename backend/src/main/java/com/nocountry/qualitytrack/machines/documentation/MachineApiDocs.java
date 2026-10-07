package com.nocountry.qualitytrack.machines.documentation;

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
        name = "10 · Producción · Máquinas",
        description = "Catálogo operativo mínimo de máquinas utilizadas durante OperationExecution. No representa mantenimiento ni planificación de capacidad."
)
public @interface MachineApiDocs {
}
