CREATE TABLE routing_sheets (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    work_order_id BIGINT NOT NULL,
    revision INTEGER NOT NULL,
    purpose TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    created_by_user_id BIGINT NOT NULL,
    approved_by_user_id BIGINT,
    approved_at TIMESTAMPTZ,
    released_by_user_id BIGINT,
    released_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_routing_sheets_work_order_revision UNIQUE (work_order_id, revision),
    CONSTRAINT fk_routing_sheets_work_order FOREIGN KEY (work_order_id)
        REFERENCES work_orders (id) ON DELETE RESTRICT,
    CONSTRAINT fk_routing_sheets_created_by FOREIGN KEY (created_by_user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_routing_sheets_approved_by FOREIGN KEY (approved_by_user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_routing_sheets_released_by FOREIGN KEY (released_by_user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT chk_routing_sheets_revision CHECK (revision > 0),
    CONSTRAINT chk_routing_sheets_purpose CHECK (
        purpose IN ('PRODUCTION', 'REWORK')
    ),
    CONSTRAINT chk_routing_sheets_status CHECK (
        status IN ('DRAFT', 'APPROVED', 'RELEASED')
    ),
    CONSTRAINT chk_routing_sheets_audit_state CHECK (
        (
            status = 'DRAFT'
            AND approved_by_user_id IS NULL
            AND approved_at IS NULL
            AND released_by_user_id IS NULL
            AND released_at IS NULL
        )
        OR
        (
            status = 'APPROVED'
            AND approved_by_user_id IS NOT NULL
            AND approved_at IS NOT NULL
            AND released_by_user_id IS NULL
            AND released_at IS NULL
        )
        OR
        (
            status = 'RELEASED'
            AND approved_by_user_id IS NOT NULL
            AND approved_at IS NOT NULL
            AND released_by_user_id IS NOT NULL
            AND released_at IS NOT NULL
        )
    )
);

CREATE INDEX idx_routing_sheets_work_order
    ON routing_sheets (work_order_id);

CREATE UNIQUE INDEX uq_routing_sheets_production_work_order
    ON routing_sheets (work_order_id)
    WHERE purpose = 'PRODUCTION';

CREATE INDEX idx_routing_sheets_status
    ON routing_sheets (status);

CREATE TABLE routing_operations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    routing_sheet_id BIGINT NOT NULL,
    sequence_number INTEGER NOT NULL,
    code VARCHAR(40) NOT NULL,
    name VARCHAR(150) NOT NULL,
    instructions TEXT,
    estimated_minutes INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_routing_operations_sheet_sequence UNIQUE (
        routing_sheet_id,
        sequence_number
    ),
    CONSTRAINT fk_routing_operations_sheet FOREIGN KEY (routing_sheet_id)
        REFERENCES routing_sheets (id) ON DELETE CASCADE,
    CONSTRAINT chk_routing_operations_sequence CHECK (sequence_number > 0),
    CONSTRAINT chk_routing_operations_estimated_minutes CHECK (estimated_minutes > 0),
    CONSTRAINT chk_routing_operations_code CHECK (BTRIM(code) <> ''),
    CONSTRAINT chk_routing_operations_name CHECK (BTRIM(name) <> ''),
    CONSTRAINT chk_routing_operations_instructions CHECK (
        instructions IS NULL OR BTRIM(instructions) <> ''
    )
);

CREATE INDEX idx_routing_operations_sheet
    ON routing_operations (routing_sheet_id);
