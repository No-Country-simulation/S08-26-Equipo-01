package com.nocountry.qualitytrack.documents.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Component
@ConditionalOnProperty(
        name = "app.documents.storage-provider",
        havingValue = "cloudinary"
)
public class CloudinaryDocumentStorage implements DocumentStorage {

    private static final String RESOURCE_TYPE = "raw";
    private static final String DELIVERY_TYPE = "authenticated";

    private final Cloudinary cloudinary;

    public CloudinaryDocumentStorage(
            @Value("${app.documents.cloudinary.url:}") String cloudinaryUrl
    ) {
        if (cloudinaryUrl == null || cloudinaryUrl.isBlank()) {
            throw new IllegalStateException(
                    "CLOUDINARY_URL es obligatorio cuando DOCUMENT_STORAGE_PROVIDER=cloudinary."
            );
        }

        this.cloudinary = new Cloudinary(cloudinaryUrl.trim());
    }

    @Override
    public StoredDocumentFile store(
            Long customerId,
            Long caseId,
            Integer version,
            String fileName,
            InputStream inputStream
    ) {
        try {
            byte[] content = inputStream.readAllBytes();
            String checksum = sha256(content);
            String folder = buildFolder(customerId, caseId);
            String publicId = buildPublicId(version, fileName);

            Map<?, ?> result = cloudinary.uploader().upload(
                    new ByteArrayInputStream(content),
                    ObjectUtils.asMap(
                            "resource_type", RESOURCE_TYPE,
                            "type", DELIVERY_TYPE,
                            "folder", folder,
                            "public_id", publicId,
                            "overwrite", false
                    )
            );

            Object storedPublicId = result.get("public_id");
            if (storedPublicId == null || storedPublicId.toString().isBlank()) {
                throw new DocumentStorageException(
                        "Cloudinary no devolvió un identificador para el archivo almacenado."
                );
            }

            return new StoredDocumentFile(
                    storedPublicId.toString(),
                    content.length,
                    checksum
            );
        } catch (IOException | NoSuchAlgorithmException exception) {
            throw new DocumentStorageException(
                    "No fue posible almacenar el documento en Cloudinary.",
                    exception
            );
        } catch (DocumentStorageException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            throw new DocumentStorageException(
                    "No fue posible almacenar el documento en Cloudinary.",
                    exception
            );
        }
    }

    @Override
    public Resource load(String storageKey) {
        requireStorageKey(storageKey);

        try {
            String signedUrl = cloudinary.url()
                    .resourceType(RESOURCE_TYPE)
                    .type(DELIVERY_TYPE)
                    .secure(true)
                    .signed(true)
                    .generate(storageKey);

            return new UrlResource(signedUrl);
        } catch (MalformedURLException | RuntimeException exception) {
            throw new DocumentStorageException(
                    "No fue posible generar el acceso al documento almacenado en Cloudinary.",
                    exception
            );
        }
    }

    @Override
    public void deleteQuietly(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            return;
        }

        try {
            cloudinary.uploader().destroy(
                    storageKey,
                    ObjectUtils.asMap(
                            "resource_type", RESOURCE_TYPE,
                            "type", DELIVERY_TYPE,
                            "invalidate", true
                    )
            );
        } catch (Exception ignored) {
            // Cleanup must never mask the original transaction failure.
        }
    }

    private String buildFolder(Long customerId, Long caseId) {
        if (customerId == null || caseId == null) {
            throw new DocumentStorageException(
                    "El documento debe pertenecer a una empresa y a un expediente."
            );
        }

        return "qualitytrack/" + customerId + "/case-" + caseId;
    }

    private String buildPublicId(Integer version, String fileName) {
        if (version == null || version < 1) {
            throw new DocumentStorageException("La versión del documento no es válida.");
        }

        return "v" + version
                + "-" + UUID.randomUUID()
                + fileExtension(fileName);
    }

    private String fileExtension(String fileName) {
        if (fileName == null) {
            return "";
        }

        int dot = fileName.lastIndexOf('.');
        if (dot <= 0 || dot == fileName.length() - 1) {
            return "";
        }

        String extension = fileName.substring(dot + 1)
                .toLowerCase(Locale.ROOT);

        if (!extension.matches("[a-z0-9]{1,12}")) {
            return "";
        }

        return "." + extension;
    }

    private String sha256(byte[] content) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        return HexFormat.of().formatHex(digest.digest(content));
    }

    private void requireStorageKey(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            throw new DocumentStorageException("La clave de almacenamiento no es válida.");
        }
    }
}
