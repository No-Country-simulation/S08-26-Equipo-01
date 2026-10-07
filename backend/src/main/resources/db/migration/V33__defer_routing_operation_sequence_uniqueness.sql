ALTER TABLE routing_operations
    DROP CONSTRAINT uq_routing_operations_sheet_sequence;

ALTER TABLE routing_operations
    ADD CONSTRAINT uq_routing_operations_sheet_sequence
    UNIQUE (routing_sheet_id, sequence_number)
    DEFERRABLE INITIALLY DEFERRED;
