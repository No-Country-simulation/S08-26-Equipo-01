ALTER TABLE job_cases
    DROP CONSTRAINT chk_job_cases_status;

ALTER TABLE job_cases
    ADD CONSTRAINT chk_job_cases_status CHECK (
        status IN (
            'SUBMITTED',
            'UNDER_REVIEW',
            'WAITING_CUSTOMER_INFO',
            'READY_FOR_QUOTATION',
            'IN_PRODUCTION',
            'COMPLETED',
            'CANCELLED'
        )
    ),
    ADD CONSTRAINT chk_job_cases_closed_state CHECK (
        (
            status IN ('COMPLETED', 'CANCELLED')
            AND closed_at IS NOT NULL
        )
        OR
        (
            status NOT IN ('COMPLETED', 'CANCELLED')
            AND closed_at IS NULL
        )
    );

UPDATE job_cases job_case
SET status = 'COMPLETED',
    closed_at = GREATEST(
        job_case.opened_at,
        COALESCE(
            (
                SELECT MAX(delivery.delivered_at)
                FROM work_orders work_order
                JOIN deliveries delivery
                    ON delivery.work_order_id = work_order.id
                WHERE work_order.case_id = job_case.id
                  AND work_order.status = 'DELIVERED'
                  AND delivery.status = 'DELIVERED'
            ),
            NOW()
        )
    ),
    updated_at = NOW()
WHERE job_case.status = 'IN_PRODUCTION'
  AND EXISTS (
      SELECT 1
      FROM work_orders work_order
      WHERE work_order.case_id = job_case.id
        AND work_order.status = 'DELIVERED'
  );
