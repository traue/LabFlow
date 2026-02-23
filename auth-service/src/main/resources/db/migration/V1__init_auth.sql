-- V1__init_auth.sql

CREATE TABLE users (
    id            BIGSERIAL    PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(30)  NOT NULL DEFAULT 'ROLE_STUDENT',
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE profiles (
    id          BIGSERIAL    PRIMARY KEY,
    user_id     BIGINT       NOT NULL UNIQUE,
    full_name   VARCHAR(150),
    phone       VARCHAR(30),
    affiliation VARCHAR(200),
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
