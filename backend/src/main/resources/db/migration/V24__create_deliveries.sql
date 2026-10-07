CREATE TABLE deliveries (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    work_order_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    destination_recipient_name VARCHAR(160) NOT NULL,
    destination_address VARCHAR(300) NOT NULL,
    destination_city VARCHAR(120) NOT NULL,
    destination_state VARCHAR(120) NOT NULL,
    destination_postal_code VARCHAR(20) NOT NULL,
    destination_country VARCHAR(100) NOT NULL,

    delivery_method VARCHAR(80) NOT NULL,
    carrier VARCHAR(120),
    tracking_number VARCHAR(160),

    dispatched_at TIMESTAMPTZ,
    dispatched_by_user_id BIGINT,

    delivered_at TIMESTAMPTZ,
    received_by_name VARCHAR(160),
    confirmed_by_user_id BIGINT,

    evidence_document_version_id BIGINT,

    created_by_user_id BIGINT NOT NULL,

    cancelled_at TIMESTAMPTZ,
    cancelled_by_user_id BIGINT,
    cancellation_reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_deliveries_work_order FOREIGN KEY (work_order_id)
        REFERENCES work_orders (id) ON DELETE RESTRICT,
    CONSTRAINT fk_deliveries_dispatched_by FOREIGN KEY (dispatched_by_user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_deliveries_confirmed_by FOREIGN KEY (confirmed_by_user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_deliveries_evidence_version FOREIGN KEY (evidence_document_version_id)
        REFERENCES document_versions (id) ON DELETE RESTRICT,
    CONSTRAINT fk_deliveries_created_by FOREIGN KEY (created_by_user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_deliveries_cancelled_by FOREIGN KEY (cancelled_by_user_id)
        REFERENCES users (id) ON DELETE RESTRICT,

    CONSTRAINT chk_deliveries_quantity CHECK (quantity > 0),
    CONSTRAINT chk_deliveries_status CHECK (
        status IN ('PENDING', 'DISPATCHED', 'DELIVERED', 'CANCELLED')
    ),
    CONSTRAINT chk_deliveries_destination CHECK (
        BTRIM(destination_recipient_name) <> ''
        AND BTRIM(destination_address) <> ''
        AND BTRIM(destination_city) <> ''
        AND BTRIM(destination_state) <> ''
        AND BTRIM(destination_postal_code) <> ''
        AND BTRIM(destination_country) <> ''
    ),
    CONSTRAINT chk_deliveries_method CHECK (BTRIM(delivery_method) <> ''),
    CONSTRAINT chk_deliveries_tracking CHECK (
        tracking_number IS NULL OR BTRIM(tracking_number) <> ''
    ),
    CONSTRAINT chk_deliveries_carrier CHECK (
        carrier IS NULL OR BTRIM(carrier) <> ''
    ),
    CONSTRAINT chk_deliveries_lifecycle CHECK (
        (
            status = 'PENDING'
            AND dispatched_at IS NULL
            AND dispatched_by_user_id IS NULL
            AND delivered_at IS NULL
            AND received_by_name IS NULL
            AND confirmed_by_user_id IS NULL
            AND cancelled_at IS NULL
            AND cancelled_by_user_id IS NULL
            AND cancellation_reason IS NULL
        )
        OR
        (
            status = 'DISPATCHED'
            AND dispatched_at IS NOT NULL
            AND dispatched_by_user_id IS NOT NULL
            AND delivered_at IS NULL
            AND received_by_name IS NULL
            AND confirmed_by_user_id IS NULL
            AND cancelled_at IS NULL
            AND cancelled_by_user_id IS NULL
            AND cancellation_reason IS NULL
        )
        OR
        (
            status = 'DELIVERED'
            AND dispatched_at IS NOT NULL
            AND dispatched_by_user_id IS NOT NULL
            AND delivered_at IS NOT NULL
            AND delivered_at >= dispatched_at
            AND received_by_name IS NOT NULL
            AND BTRIM(received_by_name) <> ''
            AND confirmed_by_user_id IS NOT NULL
            AND cancelled_at IS NULL
            AND cancelled_by_user_id IS NULL
            AND cancellation_reason IS NULL
        )
        OR
        (
            status = 'CANCELLED'
            AND delivered_at IS NULL
            AND received_by_name IS NULL
            AND confirmed_by_user_id IS NULL
            AND cancelled_at IS NOT NULL
            AND cancelled_by_user_id IS NOT NULL
            AND cancellation_reason IS NOT NULL
            AND BTRIM(cancellation_reason) <> ''
        )
    )
);

CREATE INDEX idx_deliveries_work_order
    ON deliveries (work_order_id);
CREATE INDEX idx_deliveries_status
    ON deliveries (status);
CREATE INDEX idx_deliveries_evidence_version
    ON deliveries (evidence_document_version_id);
