ALTER TABLE documents
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN removed_at TIMESTAMPTZ,
    ADD COLUMN removed_by_user_id BIGINT;

ALTER TABLE documents
    ADD CONSTRAINT fk_documents_removed_by_user
        FOREIGN KEY (removed_by_user_id) REFERENCES users (id),
    ADD CONSTRAINT chk_documents_status
        CHECK (status IN ('ACTIVE', 'REMOVED')),
    ADD CONSTRAINT chk_documents_removal_audit
        CHECK (
            (status = 'ACTIVE' AND removed_at IS NULL AND removed_by_user_id IS NULL)
            OR
            (status = 'REMOVED' AND removed_at IS NOT NULL AND removed_by_user_id IS NOT NULL)
        );

CREATE INDEX idx_documents_case_status
    ON documents (case_id, status);
