ALTER TABLE documents
    ADD COLUMN material_id BIGINT;

ALTER TABLE documents
    DROP CONSTRAINT chk_documents_owner;

ALTER TABLE documents
    ADD CONSTRAINT fk_documents_material
        FOREIGN KEY (material_id) REFERENCES materials (id) ON DELETE RESTRICT,
    ADD CONSTRAINT chk_documents_owner CHECK (
        ((case_id IS NOT NULL)::int
        + (material_lot_id IS NOT NULL)::int
        + (material_id IS NOT NULL)::int) = 1
    );

CREATE INDEX idx_documents_material_id
    ON documents (material_id);

CREATE UNIQUE INDEX uq_documents_active_material_technical_sheet
    ON documents (material_id)
    WHERE material_id IS NOT NULL
      AND document_type = 'MATERIAL_TECHNICAL_SHEET'
      AND status = 'ACTIVE';

ALTER TABLE materials
    ADD COLUMN technical_sheet_document_version_id BIGINT;

ALTER TABLE materials
    ADD CONSTRAINT fk_materials_technical_sheet_document_version
        FOREIGN KEY (technical_sheet_document_version_id)
        REFERENCES document_versions (id)
        ON DELETE RESTRICT;
