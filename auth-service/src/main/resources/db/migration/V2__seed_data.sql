-- V2__seed_data.sql
-- Seed admin user (password: admin123 — BCrypt hash)
INSERT INTO users (username, email, password_hash, role)
VALUES ('admin', 'admin@labflow.com', '$2b$12$gAME6KzoZ3.S.dutocloD.VWB9gmtGKZu2Ywg6EP6gz/9De18mmeO', 'ROLE_ADMIN');

INSERT INTO profiles (user_id, full_name, phone, affiliation)
VALUES (1, 'System Administrator', NULL, 'LabFlow');

-- Seed professor user (password: prof1234)
INSERT INTO users (username, email, password_hash, role)
VALUES ('prof', 'prof@labflow.com', '$2b$12$ojvi28WvLZyUR0MN4EddLOwVoXvdgfjCCObzInRlD35r1KqcdQxG2', 'ROLE_PROF');

INSERT INTO profiles (user_id, full_name, phone, affiliation)
VALUES (2, 'Professor Demo', NULL, 'Computer Science Dept.');
