CREATE TABLE quotation_adjustment_requests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    source_quotation_id BIGINT NOT NULL,
    draft_quotation_id BIGINT NOT NULL,
    requested_by_user_id BIGINT,
    notes TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    response TEXT,

    CONSTRAINT fk_quotation_adjustment_source FOREIGN KEY (source_quotation_id)
        REFERENCES quotations (id),
    CONSTRAINT fk_quotation_adjustment_draft FOREIGN KEY (draft_quotation_id)
        REFERENCES quotations (id),
    CONSTRAINT fk_quotation_adjustment_requested_by FOREIGN KEY (requested_by_user_id)
        REFERENCES users (id),
    CONSTRAINT uq_quotation_adjustment_draft UNIQUE (draft_quotation_id),
    CONSTRAINT chk_quotation_adjustment_notes_not_blank CHECK (BTRIM(notes) <> ''),
    CONSTRAINT chk_quotation_adjustment_status CHECK (status IN ('OPEN', 'RESOLVED')),
    CONSTRAINT chk_quotation_adjustment_resolution CHECK (
        (status = 'OPEN' AND resolved_at IS NULL AND response IS NULL)
        OR
        (status = 'RESOLVED' AND resolved_at IS NOT NULL AND response IS NOT NULL AND BTRIM(response) <> '')
    )
);

CREATE INDEX idx_quotation_adjustment_status
    ON quotation_adjustment_requests (status);

CREATE INDEX idx_quotation_adjustment_source
    ON quotation_adjustment_requests (source_quotation_id);

INSERT INTO quotation_adjustment_requests (
    source_quotation_id,
    draft_quotation_id,
    requested_by_user_id,
    notes,
    status,
    requested_at
)
SELECT
    source.id,
    draft.id,
    NULL,
    draft.adjustment_notes,
    'OPEN',
    draft.created_at
FROM quotations draft
JOIN quotations source
  ON source.quotation_number = draft.quotation_number
 AND source.revision = draft.revision - 1
WHERE draft.status = 'DRAFT'
  AND draft.adjustment_notes IS NOT NULL
  AND BTRIM(draft.adjustment_notes) <> ''
  AND source.status = 'SUPERSEDED';
