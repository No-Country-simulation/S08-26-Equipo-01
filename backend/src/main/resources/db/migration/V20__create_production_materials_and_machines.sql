ALTER TABLE work_orders
    ADD COLUMN actual_start_at TIMESTAMPTZ,
    ADD COLUMN actual_end_at TIMESTAMPTZ;

ALTER TABLE work_orders
    ADD CONSTRAINT chk_work_orders_actual_dates
        CHECK (
            actual_start_at IS NULL
            OR actual_end_at IS NULL
            OR actual_end_at >= actual_start_at
        );

CREATE TABLE machines (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    status TEXT NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_machines_code UNIQUE (code),
    CONSTRAINT chk_machines_code CHECK (BTRIM(code) <> ''),
    CONSTRAINT chk_machines_name CHECK (BTRIM(name) <> ''),
    CONSTRAINT chk_machines_type CHECK (type IS NULL OR BTRIM(type) <> ''),
    CONSTRAINT chk_machines_status CHECK (
        status IN ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE')
    )
);

CREATE INDEX idx_machines_status ON machines (status);

CREATE TABLE operation_executions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    routing_operation_id BIGINT NOT NULL,
    operator_id BIGINT NOT NULL,
    machine_id BIGINT,
    attempt_number INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    started_at TIMESTAMPTZ NOT NULL,
    finished_at TIMESTAMPTZ,
    quantity_processed INTEGER NOT NULL DEFAULT 0,
    quantity_accepted INTEGER NOT NULL DEFAULT 0,
    quantity_rejected INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_operation_executions_attempt UNIQUE (
        routing_operation_id,
        attempt_number
    ),
    CONSTRAINT fk_operation_executions_operation FOREIGN KEY (routing_operation_id)
        REFERENCES routing_operations (id) ON DELETE RESTRICT,
    CONSTRAINT fk_operation_executions_operator FOREIGN KEY (operator_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_operation_executions_machine FOREIGN KEY (machine_id)
        REFERENCES machines (id) ON DELETE RESTRICT,
    CONSTRAINT chk_operation_executions_attempt CHECK (attempt_number > 0),
    CONSTRAINT chk_operation_executions_status CHECK (
        status IN ('IN_PROGRESS', 'COMPLETED', 'CANCELLED')
    ),
    CONSTRAINT chk_operation_executions_processed CHECK (quantity_processed >= 0),
    CONSTRAINT chk_operation_executions_accepted CHECK (quantity_accepted >= 0),
    CONSTRAINT chk_operation_executions_rejected CHECK (quantity_rejected >= 0),
    CONSTRAINT chk_operation_executions_quantities CHECK (
        quantity_accepted + quantity_rejected = quantity_processed
    ),
    CONSTRAINT chk_operation_executions_dates CHECK (
        finished_at IS NULL OR finished_at >= started_at
    ),
    CONSTRAINT chk_operation_executions_state CHECK (
        (status = 'IN_PROGRESS' AND finished_at IS NULL)
        OR
        (
            status = 'COMPLETED'
            AND finished_at IS NOT NULL
            AND quantity_processed > 0
        )
        OR
        (status = 'CANCELLED' AND finished_at IS NOT NULL)
    )
);

CREATE INDEX idx_operation_executions_operation
    ON operation_executions (routing_operation_id);
CREATE INDEX idx_operation_executions_operator
    ON operation_executions (operator_id);
CREATE INDEX idx_operation_executions_machine
    ON operation_executions (machine_id);
CREATE INDEX idx_operation_executions_status
    ON operation_executions (status);

CREATE TABLE materials (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name TEXT NOT NULL,
    specification TEXT,
    unit VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_materials_code UNIQUE (code),
    CONSTRAINT chk_materials_code CHECK (BTRIM(code) <> ''),
    CONSTRAINT chk_materials_name CHECK (BTRIM(name) <> ''),
    CONSTRAINT chk_materials_specification CHECK (
        specification IS NULL OR BTRIM(specification) <> ''
    ),
    CONSTRAINT chk_materials_unit CHECK (BTRIM(unit) <> '')
);

CREATE TABLE material_lots (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    material_id BIGINT NOT NULL,
    lot_number VARCHAR(100) NOT NULL,
    supplier TEXT,
    received_at TIMESTAMPTZ NOT NULL,
    quantity_received NUMERIC(14, 3) NOT NULL,
    certificate_document_version_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_material_lots_material_number UNIQUE (
        material_id,
        lot_number
    ),
    CONSTRAINT fk_material_lots_material FOREIGN KEY (material_id)
        REFERENCES materials (id) ON DELETE RESTRICT,
    CONSTRAINT fk_material_lots_certificate_version
        FOREIGN KEY (certificate_document_version_id)
        REFERENCES document_versions (id) ON DELETE RESTRICT,
    CONSTRAINT chk_material_lots_number CHECK (BTRIM(lot_number) <> ''),
    CONSTRAINT chk_material_lots_supplier CHECK (
        supplier IS NULL OR BTRIM(supplier) <> ''
    ),
    CONSTRAINT chk_material_lots_quantity CHECK (quantity_received > 0)
);

CREATE INDEX idx_material_lots_material ON material_lots (material_id);
CREATE INDEX idx_material_lots_certificate_version
    ON material_lots (certificate_document_version_id);

CREATE TABLE work_order_materials (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    work_order_id BIGINT NOT NULL,
    material_lot_id BIGINT NOT NULL,
    quantity_used NUMERIC(14, 3) NOT NULL,
    recorded_by_user_id BIGINT NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT uq_work_order_materials_order_lot UNIQUE (
        work_order_id,
        material_lot_id
    ),
    CONSTRAINT fk_work_order_materials_work_order FOREIGN KEY (work_order_id)
        REFERENCES work_orders (id) ON DELETE RESTRICT,
    CONSTRAINT fk_work_order_materials_lot FOREIGN KEY (material_lot_id)
        REFERENCES material_lots (id) ON DELETE RESTRICT,
    CONSTRAINT fk_work_order_materials_recorded_by FOREIGN KEY (recorded_by_user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT chk_work_order_materials_quantity CHECK (quantity_used > 0)
);

CREATE INDEX idx_work_order_materials_work_order
    ON work_order_materials (work_order_id);
CREATE INDEX idx_work_order_materials_lot
    ON work_order_materials (material_lot_id);
CREATE INDEX idx_work_order_materials_recorded_by
    ON work_order_materials (recorded_by_user_id);
