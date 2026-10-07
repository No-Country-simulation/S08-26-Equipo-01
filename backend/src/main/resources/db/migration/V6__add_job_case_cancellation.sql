ALTER TABLE job_cases
    DROP CONSTRAINT chk_job_cases_status;

ALTER TABLE job_cases
    ADD COLUMN cancelled_by_user_id BIGINT,
    ADD COLUMN cancelled_at TIMESTAMPTZ,
    ADD COLUMN cancellation_reason TEXT;

ALTER TABLE job_cases
    ADD CONSTRAINT fk_job_cases_cancelled_by_user
        FOREIGN KEY (cancelled_by_user_id) REFERENCES users (id),
    ADD CONSTRAINT chk_job_cases_status CHECK (
        status IN (
            'SUBMITTED',
            'UNDER_REVIEW',
            'WAITING_CUSTOMER_INFO',
            'READY_FOR_QUOTATION',
            'CANCELLED'
        )
    ),
    ADD CONSTRAINT chk_job_cases_cancellation_reason CHECK (
        cancellation_reason IS NULL OR BTRIM(cancellation_reason) <> ''
    ),
    ADD CONSTRAINT chk_job_cases_cancelled_at CHECK (
        cancelled_at IS NULL OR cancelled_at >= opened_at
    ),
    ADD CONSTRAINT chk_job_cases_cancellation_state CHECK (
        (
            status = 'CANCELLED'
            AND cancelled_by_user_id IS NOT NULL
            AND cancelled_at IS NOT NULL
            AND closed_at IS NOT NULL
            AND closed_at = cancelled_at
        )
        OR
        (
            status <> 'CANCELLED'
            AND cancelled_by_user_id IS NULL
            AND cancelled_at IS NULL
            AND cancellation_reason IS NULL
        )
    );
