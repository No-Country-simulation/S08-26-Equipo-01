CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    account_type TEXT NOT NULL,
    status TEXT NOT NULL,
    email_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_users_first_name_not_blank CHECK (BTRIM(first_name) <> ''),
    CONSTRAINT chk_users_last_name_not_blank CHECK (BTRIM(last_name) <> ''),
    CONSTRAINT chk_users_email_not_blank CHECK (BTRIM(email) <> ''),
    CONSTRAINT chk_users_account_type CHECK (account_type IN ('CUSTOMER', 'INTERNAL')),
    CONSTRAINT chk_users_account_status CHECK (
        (account_type = 'CUSTOMER' AND status IN ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED'))
        OR
        (account_type = 'INTERNAL' AND status IN ('PENDING_ACTIVATION', 'ACTIVE', 'SUSPENDED'))
    )
);

CREATE UNIQUE INDEX uq_users_email_lower ON users (LOWER(BTRIM(email)));

CREATE TABLE user_system_roles (
    user_id BIGINT NOT NULL,
    role TEXT NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_user_system_roles PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_system_roles_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_user_system_roles_role CHECK (
        role IN ('ADMIN', 'COMMERCIAL', 'ENGINEERING', 'PRODUCTION', 'QUALITY')
    )
);

CREATE TABLE email_verification_tokens (
    user_id BIGINT PRIMARY KEY,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_email_verification_token_hash UNIQUE (token_hash),
    CONSTRAINT fk_email_verification_tokens_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_email_verification_expiration CHECK (expires_at > created_at)
);

CREATE TABLE password_reset_tokens (
    user_id BIGINT PRIMARY KEY,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_password_reset_token_hash UNIQUE (token_hash),
    CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_password_reset_expiration CHECK (expires_at > created_at)
);
