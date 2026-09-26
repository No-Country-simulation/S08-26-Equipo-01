ALTER TABLE quotations
    ADD COLUMN rejected_at TIMESTAMPTZ,
    ADD COLUMN rejection_reason TEXT;

ALTER TABLE quotations
    DROP CONSTRAINT chk_quotations_status,
    DROP CONSTRAINT chk_quotations_sent_state;

ALTER TABLE quotations
    ADD CONSTRAINT chk_quotations_status CHECK (
        status IN ('DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'SUPERSEDED', 'EXPIRED', 'CANCELLED')
    ),
    ADD CONSTRAINT chk_quotations_sent_state CHECK (
        status NOT IN ('SENT', 'APPROVED', 'REJECTED', 'SUPERSEDED', 'EXPIRED')
        OR (sent_at IS NOT NULL AND valid_until IS NOT NULL AND estimated_delivery_date IS NOT NULL)
    ),
    ADD CONSTRAINT chk_quotations_rejection_state CHECK (
        (status = 'REJECTED' AND rejected_at IS NOT NULL)
        OR (status <> 'REJECTED' AND rejected_at IS NULL AND rejection_reason IS NULL)
    );
