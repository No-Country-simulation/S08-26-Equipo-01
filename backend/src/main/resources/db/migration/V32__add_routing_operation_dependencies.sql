CREATE TABLE routing_operation_dependencies (
    operation_id BIGINT NOT NULL,
    prerequisite_operation_id BIGINT NOT NULL,
    PRIMARY KEY (operation_id, prerequisite_operation_id),
    CONSTRAINT fk_routing_operation_dependencies_operation
        FOREIGN KEY (operation_id)
        REFERENCES routing_operations(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_routing_operation_dependencies_prerequisite
        FOREIGN KEY (prerequisite_operation_id)
        REFERENCES routing_operations(id)
        ON DELETE CASCADE,
    CONSTRAINT ck_routing_operation_dependency_not_self
        CHECK (operation_id <> prerequisite_operation_id)
);

CREATE INDEX idx_routing_operation_dependencies_prerequisite
    ON routing_operation_dependencies(prerequisite_operation_id);

-- Preserve the previous linear execution semantics for existing routes.
-- Each operation starts by depending on the immediately previous sequence.
INSERT INTO routing_operation_dependencies (operation_id, prerequisite_operation_id)
SELECT operation_id, prerequisite_operation_id
FROM (
    SELECT
        id AS operation_id,
        LAG(id) OVER (
            PARTITION BY routing_sheet_id
            ORDER BY sequence_number, id
        ) AS prerequisite_operation_id
    FROM routing_operations
) ordered_operations
WHERE prerequisite_operation_id IS NOT NULL;
