ALTER TABLE work_orders
    ADD COLUMN planned_quantity INTEGER;

UPDATE work_orders work_order
SET planned_quantity = request.quantity
FROM job_cases job_case
JOIN customer_requests request ON request.id = job_case.request_id
WHERE job_case.id = work_order.case_id;

ALTER TABLE work_orders
    ALTER COLUMN planned_quantity SET NOT NULL,
    ADD CONSTRAINT chk_work_orders_planned_quantity CHECK (planned_quantity > 0);
