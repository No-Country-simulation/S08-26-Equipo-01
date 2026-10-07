CREATE TABLE work_order_material_plans (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    work_order_id BIGINT NOT NULL,
    material_id BIGINT NOT NULL,
    planned_quantity NUMERIC(14, 3) NOT NULL,
    planned_by_user_id BIGINT NOT NULL,
    planned_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT uq_work_order_material_plans_order_material UNIQUE (
        work_order_id,
        material_id
    ),
    CONSTRAINT fk_work_order_material_plans_work_order FOREIGN KEY (work_order_id)
        REFERENCES work_orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_work_order_material_plans_material FOREIGN KEY (material_id)
        REFERENCES materials (id) ON DELETE RESTRICT,
    CONSTRAINT fk_work_order_material_plans_planned_by FOREIGN KEY (planned_by_user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT chk_work_order_material_plans_quantity CHECK (planned_quantity > 0)
);

CREATE INDEX idx_work_order_material_plans_work_order
    ON work_order_material_plans (work_order_id);
CREATE INDEX idx_work_order_material_plans_material
    ON work_order_material_plans (material_id);
