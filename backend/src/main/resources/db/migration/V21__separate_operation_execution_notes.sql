ALTER TABLE operation_executions
    ADD COLUMN start_notes TEXT,
    ADD COLUMN completion_notes TEXT,
    ADD COLUMN cancellation_reason TEXT;

-- Migra las notas creadas con V20. El flujo anterior concatenaba inicio y cierre
-- con un salto de línea, por lo que se conserva la mayor cantidad de contexto posible.
UPDATE operation_executions
SET
    start_notes = CASE
        WHEN status = 'IN_PROGRESS' THEN notes
        WHEN POSITION(CHR(10) IN COALESCE(notes, '')) > 0
            THEN RTRIM(
                SUBSTRING(notes FROM 1 FOR POSITION(CHR(10) IN notes) - 1),
                CHR(13)
            )
        ELSE NULL
    END,
    completion_notes = CASE
        WHEN status = 'COMPLETED' THEN
            CASE
                WHEN POSITION(CHR(10) IN COALESCE(notes, '')) > 0
                    THEN SUBSTRING(notes FROM POSITION(CHR(10) IN notes) + 1)
                ELSE notes
            END
        ELSE NULL
    END,
    cancellation_reason = CASE
        WHEN status = 'CANCELLED' THEN
            CASE
                WHEN POSITION(CHR(10) IN COALESCE(notes, '')) > 0
                    THEN SUBSTRING(notes FROM POSITION(CHR(10) IN notes) + 1)
                ELSE notes
            END
        ELSE NULL
    END
WHERE notes IS NOT NULL;

ALTER TABLE operation_executions
    DROP COLUMN notes;

ALTER TABLE operation_executions
    ADD CONSTRAINT chk_operation_executions_cancellation_reason
        CHECK (
            status <> 'CANCELLED'
            OR (
                cancellation_reason IS NOT NULL
                AND BTRIM(cancellation_reason) <> ''
            )
        );
