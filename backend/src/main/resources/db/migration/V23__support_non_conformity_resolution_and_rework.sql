ALTER TABLE routing_sheets
    ADD COLUMN non_conformity_id BIGINT;

ALTER TABLE routing_sheets
    ADD CONSTRAINT fk_routing_sheets_non_conformity
        FOREIGN KEY (non_conformity_id)
        REFERENCES non_conformities (id)
        ON DELETE RESTRICT;

ALTER TABLE routing_sheets
    ADD CONSTRAINT chk_routing_sheets_rework_link
        CHECK (
            (purpose = 'PRODUCTION' AND non_conformity_id IS NULL)
            OR
            (purpose = 'REWORK' AND non_conformity_id IS NOT NULL)
        );

CREATE INDEX idx_routing_sheets_non_conformity
    ON routing_sheets (non_conformity_id);

ALTER TABLE quality_inspections
    ADD COLUMN rework_non_conformity_id BIGINT;

ALTER TABLE quality_inspections
    ADD CONSTRAINT fk_quality_inspections_rework_non_conformity
        FOREIGN KEY (rework_non_conformity_id)
        REFERENCES non_conformities (id)
        ON DELETE RESTRICT;

CREATE INDEX idx_quality_inspections_rework_non_conformity
    ON quality_inspections (rework_non_conformity_id);

ALTER TABLE non_conformities
    ADD COLUMN resolved_by_user_id BIGINT,
    ADD COLUMN resolution_notes TEXT;

ALTER TABLE non_conformities
    ADD CONSTRAINT fk_non_conformities_resolved_by
        FOREIGN KEY (resolved_by_user_id)
        REFERENCES users (id)
        ON DELETE RESTRICT;

ALTER TABLE non_conformities
    ADD CONSTRAINT chk_non_conformities_resolution_notes
        CHECK (
            resolution_notes IS NULL
            OR BTRIM(resolution_notes) <> ''
        );

ALTER TABLE non_conformities
    ADD CONSTRAINT chk_non_conformities_resolution_actor
        CHECK (
            (status = 'OPEN' AND resolved_by_user_id IS NULL)
            OR
            (status = 'CLOSED' AND resolved_by_user_id IS NOT NULL)
        );

CREATE INDEX idx_non_conformities_resolved_by
    ON non_conformities (resolved_by_user_id);
