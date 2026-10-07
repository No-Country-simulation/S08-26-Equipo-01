CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT,
    document_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by_user_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_documents_case
        FOREIGN KEY (case_id) REFERENCES job_cases (id),
    CONSTRAINT fk_documents_created_by_user
        FOREIGN KEY (created_by_user_id) REFERENCES users (id),
    CONSTRAINT chk_documents_type_not_blank
        CHECK (BTRIM(document_type) <> ''),
    CONSTRAINT chk_documents_name_not_blank
        CHECK (BTRIM(name) <> ''),
    CONSTRAINT chk_documents_description_not_blank
        CHECK (description IS NULL OR BTRIM(description) <> '')
);

CREATE TABLE document_versions (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL,
    version INTEGER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    mime_type VARCHAR(150) NOT NULL,
    file_size BIGINT,
    checksum VARCHAR(64) NOT NULL,
    uploaded_by_user_id BIGINT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_document_versions_document
        FOREIGN KEY (document_id) REFERENCES documents (id),
    CONSTRAINT fk_document_versions_uploaded_by_user
        FOREIGN KEY (uploaded_by_user_id) REFERENCES users (id),
    CONSTRAINT uq_document_versions_document_version
        UNIQUE (document_id, version),
    CONSTRAINT uq_document_versions_storage_key
        UNIQUE (storage_key),
    CONSTRAINT chk_document_versions_version_positive
        CHECK (version > 0),
    CONSTRAINT chk_document_versions_file_name_not_blank
        CHECK (BTRIM(file_name) <> ''),
    CONSTRAINT chk_document_versions_mime_type_not_blank
        CHECK (BTRIM(mime_type) <> ''),
    CONSTRAINT chk_document_versions_file_size
        CHECK (file_size IS NULL OR file_size >= 0),
    CONSTRAINT chk_document_versions_checksum_sha256
        CHECK (checksum ~ '^[0-9a-f]{64}$')
);

CREATE INDEX idx_documents_case_id
    ON documents (case_id);

CREATE INDEX idx_document_versions_document_id
    ON document_versions (document_id);
