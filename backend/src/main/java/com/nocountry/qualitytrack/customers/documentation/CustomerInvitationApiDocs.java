package com.nocountry.qualitytrack.customers.documentation;

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
        name = "03 · Invitaciones de empresa",
        description = "Gestión de invitaciones para incorporar usuarios a empresas cliente."
)
public @interface CustomerInvitationApiDocs {
}
