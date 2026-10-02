package com.nocountry.qualitytrack.documents.storage;

import org.springframework.core.io.Resource;

import java.io.InputStream;

public interface DocumentStorage {

    StoredDocumentFile store(
            Long customerId,
            Long caseId,
            Integer version,
            String fileName,
            InputStream inputStream
    );

    StoredDocumentFile storeMaterialLot(
            Long materialId,
            Long materialLotId,
            Integer version,
            String fileName,
            InputStream inputStream
    );

    Resource load(String storageKey);

    void deleteQuietly(String storageKey);
}
