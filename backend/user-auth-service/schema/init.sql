-- ============================================================
-- USER AUTH SERVICE DATABASE SCHEMA
-- Database: user_auth_db
-- ============================================================

-- ENUM types
CREATE TYPE gender_enum AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE role_enum AS ENUM ('USER', 'ADMIN');

-- ============================================================
-- TABLES
-- ============================================================

-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    is_email_verified BOOLEAN DEFAULT TRUE,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Invalid tokens (for logout/revoke functionality)
CREATE TABLE invalid_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(512) NOT NULL UNIQUE,
    expiration_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_invalid_tokens_token ON invalid_tokens(token);
CREATE INDEX idx_invalid_tokens_expiration ON invalid_tokens(expiration_time);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- BCrypt hash for "password123" - generated using BCryptPasswordEncoder with strength 10
-- Hash: $2a$10$uIUc5bo3gZIND8bRLFolceQVC2etSPWbD.rjNE8NIpOQQ6cUQBifO
INSERT INTO users (email, password_hash, full_name, phone_number, date_of_birth, gender, is_email_verified, role) VALUES
('admin@quiz.com', '$2a$10$uIUc5bo3gZIND8bRLFolceQVC2etSPWbD.rjNE8NIpOQQ6cUQBifO', 'Admin User', '0901234567', '1990-01-15', 'MALE', true, 'ADMIN'),
('teacher1@quiz.com', '$2a$10$uIUc5bo3gZIND8bRLFolceQVC2etSPWbD.rjNE8NIpOQQ6cUQBifO', 'Nguyen Van A', '0912345678', '1985-03-20', 'MALE', true, 'USER'),
('teacher2@quiz.com', '$2a$10$uIUc5bo3gZIND8bRLFolceQVC2etSPWbD.rjNE8NIpOQQ6cUQBifO', 'Tran Thi B', '0923456789', '1988-07-10', 'FEMALE', true, 'USER'),
('student1@quiz.com', '$2a$10$uIUc5bo3gZIND8bRLFolceQVC2etSPWbD.rjNE8NIpOQQ6cUQBifO', 'Le Hoang C', '0934567890', '2005-05-15', 'MALE', true, 'USER'),
('student2@quiz.com', '$2a$10$uIUc5bo3gZIND8bRLFolceQVC2etSPWbD.rjNE8NIpOQQ6cUQBifO', 'Pham Thi D', '0945678901', '2006-08-20', 'FEMALE', true, 'USER'),
('student3@quiz.com', '$2a$10$uIUc5bo3gZIND8bRLFolceQVC2etSPWbD.rjNE8NIpOQQ6cUQBifO', 'Hoang Van E', '0956789012', '2005-11-25', 'MALE', true, 'USER');
