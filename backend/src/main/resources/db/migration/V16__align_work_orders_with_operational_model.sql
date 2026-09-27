ALTER TABLE work_orders
    ADD COLUMN approved_quotation_id BIGINT,
    ADD COLUMN priority TEXT NOT NULL DEFAULT 'NORMAL',
    ADD COLUMN planned_start_date DATE,
    ADD COLUMN planned_end_date DATE;

UPDATE work_orders work_order
SET approved_quotation_id = (
    SELECT quotation.id
    FROM quotations quotation
    WHERE quotation.case_id = work_order.case_id
      AND quotation.status = 'APPROVED'
    ORDER BY quotation.revision DESC
    LIMIT 1
);

ALTER TABLE work_orders
    ALTER COLUMN approved_quotation_id SET NOT NULL,
    ADD CONSTRAINT uq_work_orders_approved_quotation UNIQUE (approved_quotation_id),
    ADD CONSTRAINT fk_work_orders_approved_quotation FOREIGN KEY (approved_quotation_id)
        REFERENCES quotations (id) ON DELETE RESTRICT,
    ADD CONSTRAINT chk_work_orders_priority CHECK (
        priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')
    ),
    ADD CONSTRAINT chk_work_orders_planned_dates CHECK (
        planned_start_date IS NULL
        OR planned_end_date IS NULL
        OR planned_start_date <= planned_end_date
    ),
    ADD CONSTRAINT chk_work_orders_planned_end_before_delivery CHECK (
        planned_end_date IS NULL
        OR planned_end_date < agreed_delivery_date
    ),
    DROP CONSTRAINT chk_work_orders_status;

UPDATE work_orders
SET work_order_number = 'OT-' || SUBSTRING(work_order_number FROM 4)
WHERE work_order_number LIKE 'WO-%';

UPDATE work_orders
SET status = CASE status
    WHEN 'PLANNING' THEN 'CREATED'
    WHEN 'READY' THEN 'READY_FOR_PRODUCTION'
    WHEN 'IN_PROGRESS' THEN 'IN_PRODUCTION'
    WHEN 'COMPLETED' THEN 'READY_FOR_DELIVERY'
    ELSE status
END;

ALTER TABLE work_orders
    ADD CONSTRAINT chk_work_orders_status CHECK (
        status IN (
            'CREATED',
            'READY_FOR_PRODUCTION',
            'IN_PRODUCTION',
            'QUALITY_PENDING',
            'QUALITY_HOLD',
            'REWORK_IN_PROGRESS',
            'READY_FOR_DELIVERY',
            'DELIVERED',
            'CANCELLED'
        )
    );

CREATE INDEX idx_work_orders_approved_quotation
    ON work_orders (approved_quotation_id);

CREATE TABLE work_order_documents (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    work_order_id BIGINT NOT NULL,
    document_id BIGINT NOT NULL,
    document_version_id BIGINT NOT NULL,
    linked_by_user_id BIGINT NOT NULL,
    linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_work_order_documents_order_document UNIQUE (work_order_id, document_id),
    CONSTRAINT fk_work_order_documents_order FOREIGN KEY (work_order_id)
        REFERENCES work_orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_work_order_documents_document FOREIGN KEY (document_id)
        REFERENCES documents (id) ON DELETE RESTRICT,
    CONSTRAINT fk_work_order_documents_version FOREIGN KEY (document_version_id)
        REFERENCES document_versions (id) ON DELETE RESTRICT,
    CONSTRAINT fk_work_order_documents_linked_by FOREIGN KEY (linked_by_user_id)
        REFERENCES users (id) ON DELETE RESTRICT
);

CREATE INDEX idx_work_order_documents_order
    ON work_order_documents (work_order_id);

CREATE INDEX idx_work_order_documents_version
    ON work_order_documents (document_version_id);
