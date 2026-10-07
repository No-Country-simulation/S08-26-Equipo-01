ALTER TABLE quotations
    ADD CONSTRAINT uq_quotations_id_case UNIQUE (id, case_id);

ALTER TABLE work_orders
    ADD CONSTRAINT uq_work_orders_id_case UNIQUE (id, case_id),
    ADD CONSTRAINT fk_work_orders_approved_quotation_case
        FOREIGN KEY (approved_quotation_id, case_id)
        REFERENCES quotations (id, case_id)
        ON DELETE RESTRICT;

ALTER TABLE documents
    ADD CONSTRAINT uq_documents_id_case UNIQUE (id, case_id);

ALTER TABLE document_versions
    ADD CONSTRAINT uq_document_versions_id_document UNIQUE (id, document_id);

ALTER TABLE work_order_documents
    ADD COLUMN case_id BIGINT;

UPDATE work_order_documents link
SET case_id = work_order.case_id
FROM work_orders work_order
WHERE work_order.id = link.work_order_id;

ALTER TABLE work_order_documents
    ALTER COLUMN case_id SET NOT NULL,
    ADD CONSTRAINT fk_work_order_documents_order_case
        FOREIGN KEY (work_order_id, case_id)
        REFERENCES work_orders (id, case_id)
        ON DELETE CASCADE,
    ADD CONSTRAINT fk_work_order_documents_document_case
        FOREIGN KEY (document_id, case_id)
        REFERENCES documents (id, case_id)
        ON DELETE RESTRICT,
    ADD CONSTRAINT fk_work_order_documents_version_document
        FOREIGN KEY (document_version_id, document_id)
        REFERENCES document_versions (id, document_id)
        ON DELETE RESTRICT;

CREATE INDEX idx_work_order_documents_case
    ON work_order_documents (case_id);
