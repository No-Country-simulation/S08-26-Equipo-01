CREATE SEQUENCE customer_request_number_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE job_case_number_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE customer_requests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    request_number VARCHAR(30) NOT NULL,
    customer_reference TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    material_requirement_type TEXT NOT NULL,
    material_requirement TEXT NOT NULL,
    requested_delivery_date DATE,
    requested_by_user_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_customer_requests_request_number UNIQUE (request_number),
    CONSTRAINT fk_customer_requests_customer FOREIGN KEY (customer_id)
        REFERENCES customers (id),
    CONSTRAINT fk_customer_requests_requested_by_user FOREIGN KEY (requested_by_user_id)
        REFERENCES users (id),
    CONSTRAINT chk_customer_requests_title_not_blank CHECK (BTRIM(title) <> ''),
    CONSTRAINT chk_customer_requests_description_not_blank CHECK (BTRIM(description) <> ''),
    CONSTRAINT chk_customer_requests_quantity_positive CHECK (quantity > 0),
    CONSTRAINT chk_customer_requests_material_requirement_type CHECK (
        material_requirement_type IN ('SPECIFIED', 'ASSISTANCE_REQUIRED')
    ),
    CONSTRAINT chk_customer_requests_material_requirement_not_blank CHECK (
        BTRIM(material_requirement) <> ''
    )
);

CREATE TABLE job_cases (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    request_id BIGINT NOT NULL,
    case_number VARCHAR(30) NOT NULL,
    status TEXT NOT NULL DEFAULT 'SUBMITTED',
    assigned_to_user_id BIGINT,
    assigned_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ NOT NULL,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_job_cases_request UNIQUE (request_id),
    CONSTRAINT uq_job_cases_case_number UNIQUE (case_number),
    CONSTRAINT fk_job_cases_request FOREIGN KEY (request_id)
        REFERENCES customer_requests (id),
    CONSTRAINT fk_job_cases_assigned_to_user FOREIGN KEY (assigned_to_user_id)
        REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_job_cases_status CHECK (
        status IN ('SUBMITTED', 'UNDER_REVIEW', 'WAITING_CUSTOMER_INFO', 'READY_FOR_QUOTATION')
    ),
    CONSTRAINT chk_job_cases_assignment CHECK (
        (assigned_to_user_id IS NULL AND assigned_at IS NULL)
        OR
        (assigned_to_user_id IS NOT NULL AND assigned_at IS NOT NULL)
    ),
    CONSTRAINT chk_job_cases_closed_at CHECK (
        closed_at IS NULL OR closed_at >= opened_at
    )
);

CREATE TABLE case_information_requests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    case_id BIGINT NOT NULL,
    question TEXT NOT NULL,
    requested_by_user_id BIGINT NOT NULL,
    requested_at TIMESTAMPTZ NOT NULL,
    response TEXT,
    responded_by_user_id BIGINT,
    responded_at TIMESTAMPTZ,

    CONSTRAINT fk_case_information_requests_case FOREIGN KEY (case_id)
        REFERENCES job_cases (id),
    CONSTRAINT fk_case_information_requests_requested_by_user FOREIGN KEY (requested_by_user_id)
        REFERENCES users (id),
    CONSTRAINT fk_case_information_requests_responded_by_user FOREIGN KEY (responded_by_user_id)
        REFERENCES users (id),
    CONSTRAINT chk_case_information_requests_question_not_blank CHECK (BTRIM(question) <> ''),
    CONSTRAINT chk_case_information_requests_response_state CHECK (
        (response IS NULL AND responded_by_user_id IS NULL AND responded_at IS NULL)
        OR
        (response IS NOT NULL AND BTRIM(response) <> '' AND responded_by_user_id IS NOT NULL AND responded_at IS NOT NULL)
    )
);

CREATE TABLE case_material_specifications (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    case_id BIGINT NOT NULL,
    material_name TEXT NOT NULL,
    standard_or_grade TEXT,
    technical_notes TEXT,
    defined_by_user_id BIGINT NOT NULL,
    defined_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT uq_case_material_specifications_case UNIQUE (case_id),
    CONSTRAINT fk_case_material_specifications_case FOREIGN KEY (case_id)
        REFERENCES job_cases (id),
    CONSTRAINT fk_case_material_specifications_defined_by_user FOREIGN KEY (defined_by_user_id)
        REFERENCES users (id),
    CONSTRAINT chk_case_material_specifications_material_name_not_blank CHECK (
        BTRIM(material_name) <> ''
    )
);

CREATE UNIQUE INDEX uq_case_information_requests_open_case
    ON case_information_requests (case_id)
    WHERE responded_at IS NULL;

CREATE INDEX idx_customer_requests_customer_id
    ON customer_requests (customer_id);

CREATE INDEX idx_customer_requests_requested_by_user_id
    ON customer_requests (requested_by_user_id);

CREATE INDEX idx_job_cases_status
    ON job_cases (status);

CREATE INDEX idx_job_cases_assigned_to_user_id
    ON job_cases (assigned_to_user_id);

CREATE INDEX idx_case_information_requests_case_id
    ON case_information_requests (case_id);
