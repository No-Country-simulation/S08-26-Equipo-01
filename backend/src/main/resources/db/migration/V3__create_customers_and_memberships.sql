CREATE TABLE customers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    rfc TEXT,
    phone TEXT,
    administrative_email TEXT,
    city TEXT,
    state TEXT,
    website TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_by_user_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_customers_name_not_blank CHECK (BTRIM(name) <> ''),
    CONSTRAINT chk_customers_status CHECK (status IN ('ACTIVE', 'SUSPENDED')),
    CONSTRAINT fk_customers_created_by_user FOREIGN KEY (created_by_user_id)
        REFERENCES users (id)
);

CREATE TABLE customer_memberships (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL,
    invited_by_user_id BIGINT,
    joined_at TIMESTAMPTZ,
    removed_by_user_id BIGINT,
    removed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_customer_memberships_customer_user UNIQUE (customer_id, user_id),
    CONSTRAINT fk_customer_memberships_customer FOREIGN KEY (customer_id)
        REFERENCES customers (id) ON DELETE CASCADE,
    CONSTRAINT fk_customer_memberships_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_customer_memberships_invited_by_user FOREIGN KEY (invited_by_user_id)
        REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_customer_memberships_removed_by_user FOREIGN KEY (removed_by_user_id)
        REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_customer_memberships_role CHECK (
        role IN ('ADMIN', 'REQUESTER', 'VIEWER')
    ),
    CONSTRAINT chk_customer_memberships_status CHECK (
        status IN ('PENDING', 'ACTIVE', 'REMOVED')
    ),
    CONSTRAINT chk_customer_memberships_lifecycle CHECK (
        (status = 'PENDING' AND joined_at IS NULL AND removed_at IS NULL AND removed_by_user_id IS NULL)
        OR
        (status = 'ACTIVE' AND joined_at IS NOT NULL AND removed_at IS NULL AND removed_by_user_id IS NULL)
        OR
        (status = 'REMOVED' AND joined_at IS NOT NULL AND removed_at IS NOT NULL)
    )
);

CREATE INDEX idx_customer_memberships_customer_id
    ON customer_memberships (customer_id);

CREATE INDEX idx_customer_memberships_user_id
    ON customer_memberships (user_id);

CREATE INDEX idx_customer_memberships_customer_status_role
    ON customer_memberships (customer_id, status, role);
