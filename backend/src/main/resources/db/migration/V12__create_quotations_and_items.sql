CREATE SEQUENCE quotation_number_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE quotations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    case_id BIGINT NOT NULL,
    quotation_number VARCHAR(30) NOT NULL,
    revision INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    currency VARCHAR(3) NOT NULL DEFAULT 'MXN',
    subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
    tax_rate NUMERIC(7, 4) NOT NULL DEFAULT 0,
    tax NUMERIC(14, 2) NOT NULL DEFAULT 0,
    total NUMERIC(14, 2) NOT NULL DEFAULT 0,
    valid_until DATE,
    estimated_delivery_date DATE,
    adjustment_notes TEXT,
    sent_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    cancelled_by_user_id BIGINT,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_by_user_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_quotations_number_revision UNIQUE (quotation_number, revision),
    CONSTRAINT uq_quotations_case_revision UNIQUE (case_id, revision),
    CONSTRAINT fk_quotations_case FOREIGN KEY (case_id)
        REFERENCES job_cases (id) ON DELETE RESTRICT,
    CONSTRAINT fk_quotations_created_by FOREIGN KEY (created_by_user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_quotations_cancelled_by FOREIGN KEY (cancelled_by_user_id)
        REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_quotations_revision CHECK (revision > 0),
    CONSTRAINT chk_quotations_status CHECK (
        status IN ('DRAFT', 'SENT', 'APPROVED', 'SUPERSEDED', 'EXPIRED', 'CANCELLED')
    ),
    CONSTRAINT chk_quotations_currency CHECK (currency ~ '^[A-Z]{3}$'),
    CONSTRAINT chk_quotations_subtotal CHECK (subtotal >= 0),
    CONSTRAINT chk_quotations_tax_rate CHECK (tax_rate >= 0 AND tax_rate <= 100),
    CONSTRAINT chk_quotations_tax CHECK (tax >= 0),
    CONSTRAINT chk_quotations_total CHECK (total >= 0),
    CONSTRAINT chk_quotations_sent_state CHECK (
        status NOT IN ('SENT', 'APPROVED', 'SUPERSEDED', 'EXPIRED')
        OR (sent_at IS NOT NULL AND valid_until IS NOT NULL AND estimated_delivery_date IS NOT NULL)
    ),
    CONSTRAINT chk_quotations_approval_state CHECK (
        (status = 'APPROVED' AND approved_at IS NOT NULL)
        OR (status <> 'APPROVED' AND approved_at IS NULL)
    ),
    CONSTRAINT chk_quotations_cancellation_state CHECK (
        (status = 'CANCELLED' AND cancelled_at IS NOT NULL)
        OR (status <> 'CANCELLED' AND cancelled_at IS NULL AND cancellation_reason IS NULL)
    )
);

CREATE TABLE quotation_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    quotation_id BIGINT NOT NULL,
    line_number INTEGER NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL,
    unit_price NUMERIC(14, 2) NOT NULL,
    subtotal NUMERIC(14, 2) NOT NULL,

    CONSTRAINT uq_quotation_items_line UNIQUE (quotation_id, line_number),
    CONSTRAINT fk_quotation_items_quotation FOREIGN KEY (quotation_id)
        REFERENCES quotations (id) ON DELETE CASCADE,
    CONSTRAINT chk_quotation_items_line_number CHECK (line_number > 0),
    CONSTRAINT chk_quotation_items_description_not_blank CHECK (BTRIM(description) <> ''),
    CONSTRAINT chk_quotation_items_quantity CHECK (quantity > 0),
    CONSTRAINT chk_quotation_items_unit_price CHECK (unit_price >= 0),
    CONSTRAINT chk_quotation_items_subtotal CHECK (subtotal >= 0)
);

CREATE UNIQUE INDEX uq_quotations_active_case
    ON quotations (case_id)
    WHERE status IN ('DRAFT', 'SENT', 'APPROVED');

CREATE INDEX idx_quotations_case
    ON quotations (case_id);

CREATE INDEX idx_quotations_status
    ON quotations (status);

CREATE INDEX idx_quotations_valid_until
    ON quotations (valid_until)
    WHERE status = 'SENT';

CREATE INDEX idx_quotation_items_quotation
    ON quotation_items (quotation_id);
