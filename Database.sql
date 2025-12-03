-- ENUM định nghĩa
CREATE TYPE gender_enum AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE role_enum AS ENUM ('USER', 'TEACHER', 'ADMIN');
CREATE TYPE quiz_visibility_enum AS ENUM ('PUBLIC', 'PRIVATE');
CREATE TYPE question_type_enum AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'ESSAY');
CREATE TYPE difficulty_enum AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE class_role_enum AS ENUM ('TEACHER', 'STUDENT', 'TA');

-- Bảng người dùng (User Auth Service)
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

-- Bảng token bị vô hiệu (logout / revoke)
CREATE TABLE invalid_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(512) NOT NULL UNIQUE,
    expiration_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bảng token reset mật khẩu
CREATE TABLE password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bảng Quiz
CREATE TABLE quizzes (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_score INT DEFAULT 0,
    duration_minutes INT,
    max_attempts INT DEFAULT 1,
    visibility quiz_visibility_enum DEFAULT 'PUBLIC',
    topic VARCHAR(100),
    difficulty difficulty_enum,
    tags TEXT[],
    creator_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Câu hỏi trong quiz
CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT REFERENCES quizzes(id) ON DELETE CASCADE,
    type question_type_enum NOT NULL,
    content TEXT NOT NULL,
    options JSONB,
    correct_answer JSONB,
    score INT DEFAULT 1,
    difficulty difficulty_enum,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bảng lượt làm quiz
CREATE TABLE attempts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    quiz_id BIGINT REFERENCES quizzes(id) ON DELETE CASCADE,
    start_time TIMESTAMP DEFAULT NOW(),
    end_time TIMESTAMP,
    score INT DEFAULT 0,
    is_submitted BOOLEAN DEFAULT FALSE,
    shuffle_seed INT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bảng lưu câu trả lời người dùng
CREATE TABLE attempt_answers (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT REFERENCES attempts(id) ON DELETE CASCADE,
    question_id BIGINT REFERENCES questions(id) ON DELETE CASCADE,
    answer JSONB,
    is_correct BOOLEAN,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bảng lớp học
CREATE TABLE classes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    topic VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    teacher_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    invitation_code VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Thành viên lớp
CREATE TABLE class_members (
    id BIGSERIAL PRIMARY KEY,
    class_id BIGINT REFERENCES classes(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role class_role_enum DEFAULT 'STUDENT',
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (class_id, user_id)
);

-- Bài tập / giao bài
CREATE TABLE assignments (
    id BIGSERIAL PRIMARY KEY,
    class_id BIGINT REFERENCES classes(id) ON DELETE CASCADE,
    quiz_id BIGINT REFERENCES quizzes(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    due_time TIMESTAMP NOT NULL,
    allow_multiple_attempts BOOLEAN DEFAULT FALSE,
    max_score INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tiến độ học sinh
CREATE TABLE student_progress (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT REFERENCES assignments(id) ON DELETE CASCADE,
    student_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'NOT_STARTED',
    score INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE (assignment_id, student_id)
);

-- ====================================================================================
-- DATABASE: notification_db (Notification Service - separate database in Go)
-- ====================================================================================

-- Thông báo (Notification Service - GORM managed)
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    channel VARCHAR(20) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Preferences (User notification preferences)
CREATE TABLE preferences (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    channel VARCHAR(20) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    frequency VARCHAR(20) DEFAULT 'immediate',
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT idx_user_channel UNIQUE (user_id, channel)
);

-- Templates (Email/notification templates)
CREATE TABLE templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    channel VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_templates_name ON templates(name);






-- ====================================================================================
-- SAMPLE DATA
-- ====================================================================================

-- 1. Users (Database: quizz - User Auth Service)
INSERT INTO users (email, password_hash, full_name, phone_number, date_of_birth, gender, is_email_verified, role) VALUES
('admin@quiz.com', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890', 'Admin User', '0901234567', '1990-01-15', 'MALE', true, 'ADMIN'),
('teacher1@quiz.com', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890', 'Nguyen Van A', '0912345678', '1985-03-20', 'MALE', true, 'TEACHER'),
('teacher2@quiz.com', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890', 'Tran Thi B', '0923456789', '1988-07-10', 'FEMALE', true, 'TEACHER'),
('student1@quiz.com', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890', 'Le Hoang C', '0934567890', '2005-05-15', 'MALE', true, 'USER'),
('student2@quiz.com', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890', 'Pham Thi D', '0945678901', '2006-08-20', 'FEMALE', true, 'USER'),
('student3@quiz.com', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890', 'Hoang Van E', '0956789012', '2005-11-25', 'MALE', true, 'USER');

-- 2. Templates (Database: notification_db - Notification Service)
-- Insert welcome and password_reset templates
INSERT INTO templates (name, subject, body_html, body_text, channel) VALUES
('user_registered', 'Welcome to Quiz App', 
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1>Welcome to Quiz App</h1><p>Hello {{index .Metadata "user_name"}},</p><p>Thank you for joining our community. We are excited to have you with us.</p><p>Best regards,<br>The Quiz App Team</p></div>', 
 'Welcome to Quiz App. Thank you for joining our community.', 
 'email'),

('password_reset', 'Password Reset Request - Quiz App',
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1>Password Reset Request</h1><p>Hello {{index .Metadata "user_name"}},</p><p>Click the link below to reset your password:</p><p><a href="{{index .Metadata "reset_url"}}">Reset Password</a></p><p>This link will expire in 1 hour.</p><p>If you did not request this, please ignore this email.</p></div>',
 'Password reset request. Click link to reset: {{index .Metadata "reset_url"}}',
 'email');

