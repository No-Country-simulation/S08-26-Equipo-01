CREATE SEQUENCE work_order_number_seq START WITH 1 INCREMENT BY 1;

ALTER TABLE job_cases
    DROP CONSTRAINT chk_job_cases_status;

ALTER TABLE job_cases
    ADD CONSTRAINT chk_job_cases_status CHECK (
        status IN (
            'SUBMITTED',
            'UNDER_REVIEW',
            'WAITING_CUSTOMER_INFO',
            'READY_FOR_QUOTATION',
            'IN_PRODUCTION',
            'CANCELLED'
        )
    );

CREATE TABLE work_orders (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    case_id BIGINT NOT NULL,
    work_order_number VARCHAR(30) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PLANNING',
    agreed_delivery_date DATE NOT NULL,
    created_by_user_id BIGINT NOT NULL,
    cancelled_by_user_id BIGINT,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_work_orders_case UNIQUE (case_id),
    CONSTRAINT uq_work_orders_number UNIQUE (work_order_number),
    CONSTRAINT fk_work_orders_case FOREIGN KEY (case_id)
        REFERENCES job_cases (id) ON DELETE RESTRICT,
    CONSTRAINT fk_work_orders_created_by FOREIGN KEY (created_by_user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_work_orders_cancelled_by FOREIGN KEY (cancelled_by_user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT chk_work_orders_status CHECK (
        status IN ('PLANNING', 'READY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
    ),
    CONSTRAINT chk_work_orders_cancellation_reason CHECK (
        cancellation_reason IS NULL OR BTRIM(cancellation_reason) <> ''
    ),
    CONSTRAINT chk_work_orders_cancellation_state CHECK (
        (
            status = 'CANCELLED'
            AND cancelled_by_user_id IS NOT NULL
            AND cancelled_at IS NOT NULL
        )
        OR
        (
            status <> 'CANCELLED'
            AND cancelled_by_user_id IS NULL
            AND cancelled_at IS NULL
            AND cancellation_reason IS NULL
        )
    )
);

CREATE INDEX idx_work_orders_status ON work_orders (status);
