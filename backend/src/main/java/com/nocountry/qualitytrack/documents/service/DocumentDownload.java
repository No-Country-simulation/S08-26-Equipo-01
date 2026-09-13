package com.nocountry.qualitytrack.documents.service;

import org.springframework.core.io.Resource;

public record DocumentDownload(
        Resource resource,
        String fileName,
        String mimeType,
        long fileSize
) {
}
