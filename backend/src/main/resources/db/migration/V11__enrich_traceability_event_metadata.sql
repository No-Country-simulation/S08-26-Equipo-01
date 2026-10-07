-- Enrich existing traceability events with human-readable references used by the UI timeline.

UPDATE traceability_events te
SET metadata = te.metadata || jsonb_build_object(
    'requestNumber', cr.request_number
)
FROM job_cases jc
JOIN customer_requests cr ON cr.id = jc.request_id
WHERE te.case_id = jc.id
  AND te.event_type = 'JOB_CASE_CREATED'
  AND NOT (te.metadata ? 'requestNumber');

UPDATE traceability_events te
SET metadata = te.metadata || jsonb_build_object(
    'documentName', d.name
)
FROM document_versions dv
JOIN documents d ON d.id = dv.document_id
WHERE te.aggregate_type = 'DOCUMENT_VERSION'
  AND te.aggregate_id = dv.id
  AND te.event_type = 'DOCUMENT_VERSION_ADDED'
  AND NOT (te.metadata ? 'documentName');

UPDATE traceability_events te
SET metadata = te.metadata || jsonb_build_object(
    'requestNumber', cr.request_number
)
FROM job_cases jc
JOIN customer_requests cr ON cr.id = jc.request_id
WHERE te.case_id = jc.id
  AND te.event_type = 'CUSTOMER_REQUEST_CANCELLED'
  AND NOT (te.metadata ? 'requestNumber');
