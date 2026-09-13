package com.nocountry.qualitytrack.documents.storage;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LocalDocumentStorageTest {

    @TempDir
    Path tempDir;

    @Test
    void storesLoadsAndDeletesFile() throws Exception {
        LocalDocumentStorage storage = new LocalDocumentStorage(tempDir.toString());
        byte[] content = "quality-track".getBytes(StandardCharsets.UTF_8);

        StoredDocumentFile stored = storage.store(
                20L,
                12L,
                1,
                "plano.pdf",
                new ByteArrayInputStream(content)
        );

        assertEquals(content.length, stored.fileSize());
        assertEquals(64, stored.checksum().length());
        assertTrue(stored.storageKey().startsWith("customer-20/case-12/"));

        Resource resource = storage.load(stored.storageKey());
        assertTrue(resource.exists());
        assertEquals("quality-track", new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8));

        storage.deleteQuietly(stored.storageKey());
        assertFalse(resource.exists());
    }
}
