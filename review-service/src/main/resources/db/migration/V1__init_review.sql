-- V1__init_review.sql

CREATE TABLE reviews (
    id              BIGSERIAL    PRIMARY KEY,
    submission_id   BIGINT       NOT NULL,
    reviewer_user_id BIGINT      NOT NULL,
    comment         TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE grades (
    id          BIGSERIAL       PRIMARY KEY,
    review_id   BIGINT          NOT NULL UNIQUE,
    score       NUMERIC(5,2)    NOT NULL,
    max_score   NUMERIC(5,2)    NOT NULL DEFAULT 100.00,
    CONSTRAINT fk_grade_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);
