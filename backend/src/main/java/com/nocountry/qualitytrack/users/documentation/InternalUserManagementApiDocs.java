package com.nocountry.qualitytrack.users.documentation;

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
        name = "04 · Usuarios internos",
        description = "Provisionamiento y administración de cuentas internas, estados de acceso y roles del sistema."
)
public @interface InternalUserManagementApiDocs {
}
