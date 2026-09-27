package com.nocountry.qualitytrack.workorders.documentation;

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
        name = "08 · Órdenes de trabajo",
        description = "Gestión de la única orden de trabajo 1:1 de cada expediente: origen comercial aprobado, snapshot operativo de cantidad, planificación y versiones documentales fijadas antes de routing y ejecución."
)
public @interface WorkOrderApiDocs {
}
