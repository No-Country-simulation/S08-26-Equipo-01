ALTER TABLE documents
    ALTER COLUMN case_id DROP NOT NULL,
    ADD COLUMN material_lot_id BIGINT;

ALTER TABLE documents
    ADD CONSTRAINT fk_documents_material_lot
        FOREIGN KEY (material_lot_id) REFERENCES material_lots (id) ON DELETE RESTRICT,
    ADD CONSTRAINT chk_documents_owner CHECK (
        (case_id IS NOT NULL AND material_lot_id IS NULL)
        OR
        (case_id IS NULL AND material_lot_id IS NOT NULL)
    );

CREATE INDEX idx_documents_material_lot_id
    ON documents (material_lot_id);

CREATE UNIQUE INDEX uq_documents_active_material_lot_certificate
    ON documents (material_lot_id)
    WHERE material_lot_id IS NOT NULL
      AND document_type = 'MATERIAL_CERTIFICATE'
      AND status = 'ACTIVE';
