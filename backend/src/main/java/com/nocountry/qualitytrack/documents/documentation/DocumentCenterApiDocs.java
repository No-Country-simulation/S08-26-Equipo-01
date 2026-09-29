package com.nocountry.qualitytrack.documents.documentation;

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
        name = "Documentos",
        description = "Centro documental de solo lectura sobre documentos versionados y sus referencias operativas."
)
public @interface DocumentCenterApiDocs {
}
