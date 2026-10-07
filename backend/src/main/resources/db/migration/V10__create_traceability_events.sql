CREATE TABLE traceability_events (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT NOT NULL,
    aggregate_type VARCHAR(60) NOT NULL,
    aggregate_id BIGINT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    from_status VARCHAR(60),
    to_status VARCHAR(60),
    performed_by_user_id BIGINT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_traceability_events_case
        FOREIGN KEY (case_id) REFERENCES job_cases (id),
    CONSTRAINT fk_traceability_events_performed_by_user
        FOREIGN KEY (performed_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_traceability_events_aggregate_type_not_blank
        CHECK (BTRIM(aggregate_type) <> ''),
    CONSTRAINT chk_traceability_events_event_type_not_blank
        CHECK (BTRIM(event_type) <> ''),
    CONSTRAINT chk_traceability_events_from_status_not_blank
        CHECK (from_status IS NULL OR BTRIM(from_status) <> ''),
    CONSTRAINT chk_traceability_events_to_status_not_blank
        CHECK (to_status IS NULL OR BTRIM(to_status) <> '')
);

CREATE INDEX idx_traceability_events_case_timeline
    ON traceability_events (case_id, occurred_at, id);

CREATE INDEX idx_traceability_events_aggregate
    ON traceability_events (aggregate_type, aggregate_id);

-- Backfill the business history already present before traceability was introduced.
INSERT INTO traceability_events (
    case_id,
    aggregate_type,
    aggregate_id,
    event_type,
    performed_by_user_id,
    metadata,
    occurred_at
)
SELECT
    jc.id,
    'CUSTOMER_REQUEST',
    cr.id,
    'REQUEST_SUBMITTED',
    cr.requested_by_user_id,
    jsonb_strip_nulls(jsonb_build_object(
        'requestNumber', cr.request_number,
        'customerId', cr.customer_id,
        'title', cr.title
    )),
    cr.created_at
FROM job_cases jc
JOIN customer_requests cr ON cr.id = jc.request_id;

INSERT INTO traceability_events (
    case_id,
    aggregate_type,
    aggregate_id,
    event_type,
    to_status,
    performed_by_user_id,
    metadata,
    occurred_at
)
SELECT
    jc.id,
    'JOB_CASE',
    jc.id,
    'JOB_CASE_CREATED',
    'SUBMITTED',
    cr.requested_by_user_id,
    jsonb_strip_nulls(jsonb_build_object(
        'caseNumber', jc.case_number,
        'requestId', cr.id
    )),
    jc.opened_at
FROM job_cases jc
JOIN customer_requests cr ON cr.id = jc.request_id;

INSERT INTO traceability_events (
    case_id,
    aggregate_type,
    aggregate_id,
    event_type,
    performed_by_user_id,
    metadata,
    occurred_at
)
SELECT
    d.case_id,
    'DOCUMENT',
    d.id,
    'DOCUMENT_ADDED',
    d.created_by_user_id,
    jsonb_strip_nulls(jsonb_build_object(
        'documentType', d.document_type,
        'documentName', d.name
    )),
    d.created_at
FROM documents d;

INSERT INTO traceability_events (
    case_id,
    aggregate_type,
    aggregate_id,
    event_type,
    performed_by_user_id,
    metadata,
    occurred_at
)
SELECT
    d.case_id,
    'DOCUMENT_VERSION',
    dv.id,
    'DOCUMENT_VERSION_ADDED',
    dv.uploaded_by_user_id,
    jsonb_strip_nulls(jsonb_build_object(
        'documentId', d.id,
        'version', dv.version,
        'fileName', dv.file_name
    )),
    dv.uploaded_at
FROM document_versions dv
JOIN documents d ON d.id = dv.document_id
WHERE dv.version > 1;

INSERT INTO traceability_events (
    case_id,
    aggregate_type,
    aggregate_id,
    event_type,
    performed_by_user_id,
    metadata,
    occurred_at
)
SELECT
    d.case_id,
    'DOCUMENT',
    d.id,
    'DOCUMENT_REMOVED',
    d.removed_by_user_id,
    jsonb_strip_nulls(jsonb_build_object(
        'documentName', d.name
    )),
    d.removed_at
FROM documents d
WHERE d.status = 'REMOVED'
  AND d.removed_at IS NOT NULL;

INSERT INTO traceability_events (
    case_id,
    aggregate_type,
    aggregate_id,
    event_type,
    to_status,
    performed_by_user_id,
    metadata,
    occurred_at
)
SELECT
    jc.id,
    'JOB_CASE',
    jc.id,
    'CUSTOMER_REQUEST_CANCELLED',
    'CANCELLED',
    jc.cancelled_by_user_id,
    jsonb_strip_nulls(jsonb_build_object(
        'requestId', jc.request_id,
        'reason', jc.cancellation_reason
    )),
    jc.cancelled_at
FROM job_cases jc
WHERE jc.status = 'CANCELLED'
  AND jc.cancelled_at IS NOT NULL;
