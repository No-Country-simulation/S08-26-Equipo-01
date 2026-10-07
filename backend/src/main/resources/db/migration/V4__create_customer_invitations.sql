CREATE TABLE customer_invitations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    invited_by_user_id BIGINT NOT NULL,
    accepted_by_user_id BIGINT,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_customer_invitations_token_hash UNIQUE (token_hash),
    CONSTRAINT fk_customer_invitations_customer FOREIGN KEY (customer_id)
        REFERENCES customers (id) ON DELETE CASCADE,
    CONSTRAINT fk_customer_invitations_invited_by_user FOREIGN KEY (invited_by_user_id)
        REFERENCES users (id),
    CONSTRAINT fk_customer_invitations_accepted_by_user FOREIGN KEY (accepted_by_user_id)
        REFERENCES users (id),
    CONSTRAINT chk_customer_invitations_email_normalized CHECK (
        BTRIM(email) <> '' AND email = LOWER(BTRIM(email))
    ),
    CONSTRAINT chk_customer_invitations_role CHECK (
        role IN ('ADMIN', 'REQUESTER', 'VIEWER')
    ),
    CONSTRAINT chk_customer_invitations_status CHECK (
        status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED')
    ),
    CONSTRAINT chk_customer_invitations_acceptance_state CHECK (
        (status = 'ACCEPTED' AND accepted_by_user_id IS NOT NULL AND accepted_at IS NOT NULL)
        OR
        (status <> 'ACCEPTED' AND accepted_by_user_id IS NULL AND accepted_at IS NULL)
    )
);

CREATE UNIQUE INDEX uq_customer_invitations_pending_email
    ON customer_invitations (customer_id, email)
    WHERE status = 'PENDING';

CREATE INDEX idx_customer_invitations_customer_id
    ON customer_invitations (customer_id);

CREATE INDEX idx_customer_invitations_email
    ON customer_invitations (email);
