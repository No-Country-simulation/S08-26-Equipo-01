CREATE TABLE customer_addresses (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    label VARCHAR(120) NOT NULL,
    address VARCHAR(300) NOT NULL,
    city VARCHAR(120) NOT NULL,
    state VARCHAR(120) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    contact_name VARCHAR(160),
    contact_phone VARCHAR(30),
    delivery_instructions VARCHAR(1000),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_customer_addresses_customer FOREIGN KEY (customer_id)
        REFERENCES customers (id) ON DELETE CASCADE,
    CONSTRAINT chk_customer_addresses_label CHECK (BTRIM(label) <> ''),
    CONSTRAINT chk_customer_addresses_address CHECK (BTRIM(address) <> ''),
    CONSTRAINT chk_customer_addresses_city CHECK (BTRIM(city) <> ''),
    CONSTRAINT chk_customer_addresses_state CHECK (BTRIM(state) <> ''),
    CONSTRAINT chk_customer_addresses_postal_code CHECK (BTRIM(postal_code) <> ''),
    CONSTRAINT chk_customer_addresses_country CHECK (BTRIM(country) <> ''),
    CONSTRAINT chk_customer_addresses_contact_name CHECK (
        contact_name IS NULL OR BTRIM(contact_name) <> ''
    ),
    CONSTRAINT chk_customer_addresses_contact_phone CHECK (
        contact_phone IS NULL OR BTRIM(contact_phone) <> ''
    )
);

CREATE INDEX idx_customer_addresses_customer
    ON customer_addresses (customer_id);

CREATE UNIQUE INDEX uq_customer_addresses_default
    ON customer_addresses (customer_id)
    WHERE is_default = TRUE;

CREATE TABLE request_delivery_destinations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    request_id BIGINT NOT NULL,
    mode VARCHAR(30) NOT NULL,
    source_customer_address_id BIGINT,
    label VARCHAR(120),
    address VARCHAR(300),
    city VARCHAR(120),
    state VARCHAR(120),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    contact_name VARCHAR(160),
    contact_phone VARCHAR(30),
    delivery_instructions VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_request_delivery_destinations_request UNIQUE (request_id),
    CONSTRAINT fk_request_delivery_destinations_request FOREIGN KEY (request_id)
        REFERENCES customer_requests (id) ON DELETE CASCADE,
    CONSTRAINT fk_request_delivery_destinations_source_address FOREIGN KEY (source_customer_address_id)
        REFERENCES customer_addresses (id) ON DELETE SET NULL,
    CONSTRAINT chk_request_delivery_destinations_mode CHECK (
        mode IN ('SAVED_ADDRESS', 'CUSTOM_ADDRESS', 'CUSTOMER_PICKUP', 'DEFINE_LATER')
    ),
    CONSTRAINT chk_request_delivery_destinations_payload CHECK (
        (
            mode IN ('SAVED_ADDRESS', 'CUSTOM_ADDRESS')
            AND address IS NOT NULL
            AND BTRIM(address) <> ''
            AND city IS NOT NULL
            AND BTRIM(city) <> ''
            AND state IS NOT NULL
            AND BTRIM(state) <> ''
            AND postal_code IS NOT NULL
            AND BTRIM(postal_code) <> ''
            AND country IS NOT NULL
            AND BTRIM(country) <> ''
        )
        OR
        (
            mode IN ('CUSTOMER_PICKUP', 'DEFINE_LATER')
            AND address IS NULL
            AND city IS NULL
            AND state IS NULL
            AND postal_code IS NULL
            AND country IS NULL
        )
    ),
    CONSTRAINT chk_request_delivery_destinations_source CHECK (
        (mode = 'SAVED_ADDRESS' AND source_customer_address_id IS NOT NULL)
        OR
        (mode <> 'SAVED_ADDRESS' AND source_customer_address_id IS NULL)
    )
);

CREATE INDEX idx_request_delivery_destinations_source_address
    ON request_delivery_destinations (source_customer_address_id);

INSERT INTO request_delivery_destinations (
    request_id,
    mode,
    label
)
SELECT
    id,
    'DEFINE_LATER',
    'Destino por definir'
FROM customer_requests;

ALTER TABLE deliveries
    ADD COLUMN destination_label VARCHAR(120),
    ADD COLUMN destination_instructions VARCHAR(1000);

ALTER TABLE deliveries
    ALTER COLUMN destination_recipient_name DROP NOT NULL;

ALTER TABLE deliveries
    DROP CONSTRAINT chk_deliveries_destination;

ALTER TABLE deliveries
    ADD CONSTRAINT chk_deliveries_destination CHECK (
        (destination_recipient_name IS NULL OR BTRIM(destination_recipient_name) <> '')
        AND BTRIM(destination_address) <> ''
        AND BTRIM(destination_city) <> ''
        AND BTRIM(destination_state) <> ''
        AND BTRIM(destination_postal_code) <> ''
        AND BTRIM(destination_country) <> ''
    );
