-- ============================================================
-- CLASS ASSIGNMENT SERVICE DATABASE SCHEMA
-- Database: class_db
-- ============================================================

-- ENUM types
CREATE TYPE class_role_enum AS ENUM ('TEACHER', 'STUDENT', 'TA');

-- ============================================================
-- TABLES
-- ============================================================

-- Classes table
CREATE TABLE classes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    topic VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    teacher_id BIGINT NOT NULL, -- No FK, validated via Auth Service API
    invitation_code VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Class members table
CREATE TABLE class_members (
    id BIGSERIAL PRIMARY KEY,
    class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL, -- No FK, validated via Auth Service API
    role class_role_enum DEFAULT 'STUDENT',
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (class_id, user_id)
);

-- Assignments table
CREATE TABLE assignments (
    id BIGSERIAL PRIMARY KEY,
    class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    quiz_id BIGINT NOT NULL, -- No FK, validated via Quiz Service API
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    due_time TIMESTAMP NOT NULL,
    allow_multiple_attempts BOOLEAN DEFAULT FALSE,
    max_score INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Student progress table
CREATE TABLE student_progress (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL, -- No FK, validated via Auth Service API
    status VARCHAR(20) DEFAULT 'NOT_STARTED',
    score INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE (assignment_id, student_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_classes_status ON classes(status);
CREATE INDEX idx_classes_invitation_code ON classes(invitation_code);
CREATE INDEX idx_class_members_class_id ON class_members(class_id);
CREATE INDEX idx_class_members_user_id ON class_members(user_id);
CREATE INDEX idx_class_members_role ON class_members(role);
CREATE INDEX idx_assignments_class_id ON assignments(class_id);
CREATE INDEX idx_assignments_quiz_id ON assignments(quiz_id);
CREATE INDEX idx_assignments_due_time ON assignments(due_time);
CREATE INDEX idx_student_progress_assignment_id ON student_progress(assignment_id);
CREATE INDEX idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX idx_student_progress_status ON student_progress(status);

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Sample classes (teacher_id references users from auth service)
INSERT INTO classes (name, description, topic, status, teacher_id, invitation_code) VALUES
('Math 101', 'Basic Mathematics Course', 'Mathematics', 'ACTIVE', 2, 'MATH101ABC'),
('Physics Advanced', 'Advanced Physics Course', 'Physics', 'ACTIVE', 2, 'PHYS201XYZ'),
('English Grammar', 'English Grammar Course', 'English', 'ACTIVE', 3, 'ENG101DEF');

-- Sample class members (user_id references users from auth service)
INSERT INTO class_members (class_id, user_id, role) VALUES
(1, 2, 'TEACHER'),
(1, 4, 'STUDENT'),
(1, 5, 'STUDENT'),
(1, 6, 'STUDENT'),
(2, 2, 'TEACHER'),
(2, 4, 'STUDENT'),
(2, 5, 'STUDENT'),
(3, 3, 'TEACHER'),
(3, 4, 'STUDENT'),
(3, 6, 'STUDENT');

-- Sample assignments (quiz_id references quizzes from quiz service)
INSERT INTO assignments (class_id, quiz_id, title, description, start_time, due_time, allow_multiple_attempts, max_score) VALUES
(1, 1, 'Weekly Math Quiz', 'Complete this quiz by Friday', NOW(), NOW() + INTERVAL '7 days', TRUE, 100),
(2, 2, 'Physics Midterm', 'Midterm examination', NOW(), NOW() + INTERVAL '3 days', FALSE, 150),
(3, 3, 'Grammar Assessment', 'Weekly grammar check', NOW(), NOW() + INTERVAL '5 days', TRUE, 80);

-- Sample student progress
INSERT INTO student_progress (assignment_id, student_id, status, score) VALUES
(1, 4, 'COMPLETED', 85),
(1, 5, 'IN_PROGRESS', 0),
(1, 6, 'NOT_STARTED', 0),
(2, 4, 'IN_PROGRESS', 0),
(2, 5, 'NOT_STARTED', 0),
(3, 4, 'COMPLETED', 75),
(3, 6, 'NOT_STARTED', 0);
