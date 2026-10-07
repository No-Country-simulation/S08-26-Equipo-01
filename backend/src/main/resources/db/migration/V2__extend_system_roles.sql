ALTER TABLE user_system_roles
    DROP CONSTRAINT chk_user_system_roles_role;

ALTER TABLE user_system_roles
    ADD COLUMN assigned_by_user_id BIGINT;

ALTER TABLE user_system_roles
    ADD CONSTRAINT fk_user_system_roles_assigned_by_user
        FOREIGN KEY (assigned_by_user_id)
        REFERENCES users (id)
        ON DELETE SET NULL;

ALTER TABLE user_system_roles
    ADD CONSTRAINT chk_user_system_roles_role CHECK (
        role IN (
            'ADMIN',
            'COMMERCIAL',
            'ENGINEERING',
            'PRODUCTION',
            'QUALITY',
            'LOGISTICS',
            'AUDITOR'
        )
    );
