package com.nocountry.qualitytrack.documents.storage;

public record StoredDocumentFile(
        String storageKey,
        long fileSize,
        String checksum
) {
}
