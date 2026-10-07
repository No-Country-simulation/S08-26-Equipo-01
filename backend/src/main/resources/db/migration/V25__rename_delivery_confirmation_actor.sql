ALTER TABLE deliveries
    RENAME COLUMN confirmed_by_user_id TO delivered_by_user_id;

ALTER TABLE deliveries
    RENAME CONSTRAINT fk_deliveries_confirmed_by TO fk_deliveries_delivered_by;
