CREATE SEQUENCE non_conformity_number_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE quality_inspections (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    work_order_id BIGINT NOT NULL,
    inspector_user_id BIGINT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_quality_inspections_work_order FOREIGN KEY (work_order_id)
        REFERENCES work_orders (id) ON DELETE RESTRICT,
    CONSTRAINT fk_quality_inspections_inspector FOREIGN KEY (inspector_user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT chk_quality_inspections_status CHECK (
        status IN ('PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED')
    ),
    CONSTRAINT chk_quality_inspections_lifecycle CHECK (
        (
            status = 'PENDING'
            AND inspector_user_id IS NULL
            AND started_at IS NULL
            AND completed_at IS NULL
        )
        OR
        (
            status = 'IN_PROGRESS'
            AND inspector_user_id IS NOT NULL
            AND started_at IS NOT NULL
            AND completed_at IS NULL
        )
        OR
        (
            status IN ('APPROVED', 'REJECTED')
            AND inspector_user_id IS NOT NULL
            AND started_at IS NOT NULL
            AND completed_at IS NOT NULL
            AND completed_at >= started_at
        )
    )
);

CREATE INDEX idx_quality_inspections_work_order
    ON quality_inspections (work_order_id);
CREATE INDEX idx_quality_inspections_status
    ON quality_inspections (status);
CREATE INDEX idx_quality_inspections_inspector
    ON quality_inspections (inspector_user_id);

CREATE TABLE quality_measurements (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    quality_inspection_id BIGINT NOT NULL,
    characteristic VARCHAR(200) NOT NULL,
    nominal_value NUMERIC(18, 6) NOT NULL,
    lower_limit NUMERIC(18, 6) NOT NULL,
    upper_limit NUMERIC(18, 6) NOT NULL,
    measured_value NUMERIC(18, 6) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    result TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_quality_measurements_inspection FOREIGN KEY (quality_inspection_id)
        REFERENCES quality_inspections (id) ON DELETE RESTRICT,
    CONSTRAINT chk_quality_measurements_characteristic CHECK (
        BTRIM(characteristic) <> ''
    ),
    CONSTRAINT chk_quality_measurements_unit CHECK (
        BTRIM(unit) <> ''
    ),
    CONSTRAINT chk_quality_measurements_range CHECK (
        lower_limit <= nominal_value
        AND nominal_value <= upper_limit
    ),
    CONSTRAINT chk_quality_measurements_result CHECK (
        result IN ('PASS', 'FAIL')
    ),
    CONSTRAINT chk_quality_measurements_result_matches_value CHECK (
        (
            result = 'PASS'
            AND measured_value >= lower_limit
            AND measured_value <= upper_limit
        )
        OR
        (
            result = 'FAIL'
            AND (
                measured_value < lower_limit
                OR measured_value > upper_limit
            )
        )
    )
);

CREATE INDEX idx_quality_measurements_inspection
    ON quality_measurements (quality_inspection_id);
CREATE INDEX idx_quality_measurements_result
    ON quality_measurements (result);

CREATE TABLE non_conformities (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    non_conformity_number VARCHAR(30) NOT NULL,
    work_order_id BIGINT NOT NULL,
    quality_inspection_id BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN',
    affected_quantity INTEGER,
    severity VARCHAR(50),
    description TEXT,
    disposition TEXT,
    opened_by_user_id BIGINT NOT NULL,
    opened_at TIMESTAMPTZ NOT NULL,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_non_conformities_number UNIQUE (non_conformity_number),
    CONSTRAINT uq_non_conformities_inspection UNIQUE (quality_inspection_id),
    CONSTRAINT fk_non_conformities_work_order FOREIGN KEY (work_order_id)
        REFERENCES work_orders (id) ON DELETE RESTRICT,
    CONSTRAINT fk_non_conformities_inspection FOREIGN KEY (quality_inspection_id)
        REFERENCES quality_inspections (id) ON DELETE RESTRICT,
    CONSTRAINT fk_non_conformities_opened_by FOREIGN KEY (opened_by_user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT chk_non_conformities_status CHECK (
        status IN ('OPEN', 'CLOSED')
    ),
    CONSTRAINT chk_non_conformities_quantity CHECK (
        affected_quantity IS NULL OR affected_quantity > 0
    ),
    CONSTRAINT chk_non_conformities_severity CHECK (
        severity IS NULL OR BTRIM(severity) <> ''
    ),
    CONSTRAINT chk_non_conformities_description CHECK (
        description IS NULL OR BTRIM(description) <> ''
    ),
    CONSTRAINT chk_non_conformities_disposition CHECK (
        disposition IS NULL
        OR disposition IN ('REWORK', 'SCRAP', 'USE_AS_IS')
    ),
    CONSTRAINT chk_non_conformities_lifecycle CHECK (
        (status = 'OPEN' AND closed_at IS NULL)
        OR
        (
            status = 'CLOSED'
            AND closed_at IS NOT NULL
            AND disposition IS NOT NULL
        )
    )
);

CREATE INDEX idx_non_conformities_work_order
    ON non_conformities (work_order_id);
CREATE INDEX idx_non_conformities_status
    ON non_conformities (status);
