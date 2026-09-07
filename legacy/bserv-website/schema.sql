-- bserv_council schema — applications table
-- Run once:  mysql -u root -p < schema.sql
-- (submit.php also auto-creates this table if missing.)

CREATE DATABASE IF NOT EXISTS bserv_council
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE bserv_council;

CREATE TABLE IF NOT EXISTS applications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    dob DATE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    position VARCHAR(120) NOT NULL,
    address VARCHAR(500) DEFAULT NULL,
    qualification VARCHAR(200) DEFAULT NULL,
    experience VARCHAR(200) DEFAULT NULL,
    motivation TEXT DEFAULT NULL,
    resume_path VARCHAR(255) DEFAULT NULL,
    resume_original_name VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
