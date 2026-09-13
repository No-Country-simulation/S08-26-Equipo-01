package com.nocountry.qualitytrack.documents.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

@Component
@ConditionalOnProperty(
        name = "app.documents.storage-provider",
        havingValue = "local",
        matchIfMissing = true
)
public class LocalDocumentStorage implements DocumentStorage {

    private final Path root;

    public LocalDocumentStorage(
            @Value("${app.documents.storage-root:./storage/documents}") String storageRoot
    ) {
        this.root = Path.of(storageRoot).toAbsolutePath().normalize();
    }

    @Override
    public StoredDocumentFile store(
            Long customerId,
            Long caseId,
            Integer version,
            String fileName,
            InputStream inputStream
    ) {
        Path directory = root
                .resolve("customer-" + customerId)
                .resolve("case-" + caseId)
                .normalize();
        Path target = directory.resolve(
                "v" + version + "-" + UUID.randomUUID()
        ).normalize();

        ensureInsideRoot(target);

        try {
            Files.createDirectories(directory);

            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            try (DigestInputStream digestInputStream = new DigestInputStream(inputStream, digest)) {
                Files.copy(digestInputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }

            long fileSize = Files.size(target);
            String checksum = HexFormat.of().formatHex(digest.digest());
            String storageKey = root.relativize(target)
                    .toString()
                    .replace('\\', '/');

            return new StoredDocumentFile(storageKey, fileSize, checksum);
        } catch (IOException | NoSuchAlgorithmException exception) {
            try {
                Files.deleteIfExists(target);
            } catch (IOException ignored) {
                // Best effort cleanup after a failed write.
            }
            throw new DocumentStorageException("No fue posible almacenar el documento.", exception);
        }
    }

    @Override
    public Resource load(String storageKey) {
        Path target = root.resolve(storageKey).normalize();
        ensureInsideRoot(target);

        if (!Files.isRegularFile(target)) {
            throw new DocumentStorageException("No se encontró el archivo almacenado.");
        }

        return new FileSystemResource(target);
    }

    @Override
    public void deleteQuietly(String storageKey) {
        try {
            Path target = root.resolve(storageKey).normalize();
            ensureInsideRoot(target);
            Files.deleteIfExists(target);
        } catch (RuntimeException | IOException ignored) {
            // Cleanup must never mask the original transaction failure.
        }
    }

    private void ensureInsideRoot(Path target) {
        if (!target.startsWith(root)) {
            throw new DocumentStorageException("La ruta de almacenamiento no es válida.");
        }
    }
}
