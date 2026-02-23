-- V1__init_project.sql

CREATE TABLE courses (
    id         BIGSERIAL    PRIMARY KEY,
    code       VARCHAR(20)  NOT NULL UNIQUE,
    title      VARCHAR(200) NOT NULL,
    term       VARCHAR(20)  NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE projects (
    id          BIGSERIAL    PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    course_id   BIGINT       NOT NULL,
    CONSTRAINT fk_project_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE project_members (
    id              BIGSERIAL   PRIMARY KEY,
    project_id      BIGINT      NOT NULL,
    user_id         BIGINT      NOT NULL,
    role_in_project VARCHAR(30) NOT NULL DEFAULT 'CONTRIBUTOR',
    CONSTRAINT fk_pm_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT uq_pm UNIQUE (project_id, user_id)
);

CREATE TABLE submissions (
    id                BIGSERIAL    PRIMARY KEY,
    project_id        BIGINT       NOT NULL,
    submitter_user_id BIGINT       NOT NULL,
    file_url          VARCHAR(500),
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_sub_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
