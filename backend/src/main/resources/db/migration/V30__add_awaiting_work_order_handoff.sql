ALTER TABLE job_cases
    DROP CONSTRAINT chk_job_cases_status;

ALTER TABLE job_cases
    ADD CONSTRAINT chk_job_cases_status CHECK (
        status IN (
            'SUBMITTED',
            'UNDER_REVIEW',
            'WAITING_CUSTOMER_INFO',
            'READY_FOR_QUOTATION',
            'AWAITING_WORK_ORDER',
            'IN_PRODUCTION',
            'COMPLETED',
            'CANCELLED'
        )
    );

UPDATE job_cases job_case
SET status = 'AWAITING_WORK_ORDER',
    updated_at = NOW()
WHERE job_case.status = 'READY_FOR_QUOTATION'
  AND EXISTS (
      SELECT 1
      FROM quotations quotation
      WHERE quotation.case_id = job_case.id
        AND quotation.status = 'APPROVED'
  )
  AND NOT EXISTS (
      SELECT 1
      FROM work_orders work_order
      WHERE work_order.case_id = job_case.id
  );
