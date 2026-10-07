ALTER TABLE quality_measurements RENAME TO quality_checks;
ALTER TABLE quality_checks RENAME COLUMN characteristic TO name;

ALTER TABLE quality_checks
    ADD COLUMN check_type TEXT NOT NULL DEFAULT 'NUMERIC_RANGE';

ALTER TABLE quality_checks
    ALTER COLUMN check_type DROP DEFAULT;

ALTER TABLE quality_checks
    ALTER COLUMN nominal_value DROP NOT NULL,
    ALTER COLUMN lower_limit DROP NOT NULL,
    ALTER COLUMN upper_limit DROP NOT NULL,
    ALTER COLUMN measured_value DROP NOT NULL,
    ALTER COLUMN unit DROP NOT NULL;

ALTER TABLE quality_checks
    DROP CONSTRAINT chk_quality_measurements_characteristic,
    DROP CONSTRAINT chk_quality_measurements_unit,
    DROP CONSTRAINT chk_quality_measurements_range,
    DROP CONSTRAINT chk_quality_measurements_result_matches_value;

ALTER TABLE quality_checks
    ADD CONSTRAINT chk_quality_checks_name CHECK (BTRIM(name) <> ''),
    ADD CONSTRAINT chk_quality_checks_type CHECK (
        check_type IN ('NUMERIC_RANGE', 'PASS_FAIL')
    ),
    ADD CONSTRAINT chk_quality_checks_payload CHECK (
        (
            check_type = 'NUMERIC_RANGE'
            AND nominal_value IS NOT NULL
            AND lower_limit IS NOT NULL
            AND upper_limit IS NOT NULL
            AND measured_value IS NOT NULL
            AND unit IS NOT NULL
            AND BTRIM(unit) <> ''
            AND lower_limit <= nominal_value
            AND nominal_value <= upper_limit
            AND (
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
        )
        OR
        (
            check_type = 'PASS_FAIL'
            AND nominal_value IS NULL
            AND lower_limit IS NULL
            AND upper_limit IS NULL
            AND measured_value IS NULL
            AND unit IS NULL
            AND result IN ('PASS', 'FAIL')
        )
    );

ALTER INDEX idx_quality_measurements_inspection
    RENAME TO idx_quality_checks_inspection;
ALTER INDEX idx_quality_measurements_result
    RENAME TO idx_quality_checks_result;

ALTER TABLE quality_checks
    RENAME CONSTRAINT fk_quality_measurements_inspection
    TO fk_quality_checks_inspection;
ALTER TABLE quality_checks
    RENAME CONSTRAINT chk_quality_measurements_result
    TO chk_quality_checks_result;
