-- ============================================================
-- MERGED DATABASE SCHEMA FOR QUIZZ DATABASE
-- Gộp tất cả schemas từ các services vào 1 database
-- ============================================================

-- ============================================================
-- ENUM TYPES
-- ============================================================

-- User Auth Service ENUMs
DO $$ BEGIN
    CREATE TYPE gender_enum AS ENUM ('MALE', 'FEMALE', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE role_enum AS ENUM ('USER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Quiz Service ENUMs
DO $$ BEGIN
    CREATE TYPE quiz_visibility_enum AS ENUM ('PUBLIC', 'PRIVATE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE question_type_enum AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'ESSAY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE difficulty_enum AS ENUM ('EASY', 'MEDIUM', 'HARD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Class Assignment Service ENUMs
DO $$ BEGIN
    CREATE TYPE class_role_enum AS ENUM ('TEACHER', 'STUDENT', 'TA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- USER AUTH SERVICE TABLES
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS invalid_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(512) NOT NULL UNIQUE,
    expiration_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- QUIZ SERVICE TABLES
-- ============================================================

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
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
    creator_id BIGINT NOT NULL, -- No FK, validated via Auth Service API
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
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

-- Attempts table (quiz attempts by students)
CREATE TABLE IF NOT EXISTS attempts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL, -- No FK, validated via Auth Service API
    quiz_id BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    start_time TIMESTAMP DEFAULT NOW(),
    end_time TIMESTAMP,
    score INT DEFAULT 0,
    is_submitted BOOLEAN DEFAULT FALSE,
    shuffle_seed INT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Attempt answers table
CREATE TABLE IF NOT EXISTS attempt_answers (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer JSONB,
    is_correct BOOLEAN,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATION SERVICE TABLES
-- ============================================================

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL, -- No FK, validated via Auth Service API
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

-- User preferences table
CREATE TABLE IF NOT EXISTS preferences (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL, -- No FK, validated via Auth Service API
    channel VARCHAR(20) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    frequency VARCHAR(20) DEFAULT 'immediate',
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT idx_user_channel UNIQUE (user_id, channel)
);

-- Templates table (check if email_templates exists, if so use that name)
DO $$ 
BEGIN
    -- Check if templates table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'templates') THEN
        -- Check if email_templates exists (old name)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_templates') THEN
            -- email_templates already exists, skip creating templates
            RAISE NOTICE 'Table email_templates already exists, skipping templates creation';
        ELSE
            -- Create templates table
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
        END IF;
    END IF;
END $$;

-- Also create email_templates if it doesn't exist (for backward compatibility)
CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    channel VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- CLASS ASSIGNMENT SERVICE TABLES
-- ============================================================

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
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
CREATE TABLE IF NOT EXISTS class_members (
    id BIGSERIAL PRIMARY KEY,
    class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL, -- No FK, validated via Auth Service API
    role class_role_enum DEFAULT 'STUDENT',
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (class_id, user_id)
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
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
CREATE TABLE IF NOT EXISTS student_progress (
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

-- User Auth Service Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_invalid_tokens_token ON invalid_tokens(token);
CREATE INDEX IF NOT EXISTS idx_invalid_tokens_expiration ON invalid_tokens(expiration_time);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Quiz Service Indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_creator_id ON quizzes(creator_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_visibility ON quizzes(visibility);
CREATE INDEX IF NOT EXISTS idx_quizzes_topic ON quizzes(topic);
CREATE INDEX IF NOT EXISTS idx_quizzes_difficulty ON quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_quiz_id ON attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempts_submitted ON attempts(is_submitted);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt_id ON attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_question_id ON attempt_answers(question_id);

-- Notification Service Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_preferences_user_id ON preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_name ON templates(name);
CREATE INDEX IF NOT EXISTS idx_templates_channel ON templates(channel);

-- Class Assignment Service Indexes
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_status ON classes(status);
CREATE INDEX IF NOT EXISTS idx_classes_invitation_code ON classes(invitation_code);
CREATE INDEX IF NOT EXISTS idx_class_members_class_id ON class_members(class_id);
CREATE INDEX IF NOT EXISTS idx_class_members_user_id ON class_members(user_id);
CREATE INDEX IF NOT EXISTS idx_class_members_role ON class_members(role);
CREATE INDEX IF NOT EXISTS idx_assignments_class_id ON assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_quiz_id ON assignments(quiz_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_time ON assignments(due_time);
CREATE INDEX IF NOT EXISTS idx_student_progress_assignment_id ON student_progress(assignment_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_status ON student_progress(status);

-- ============================================================
-- SAMPLE DATA (Only insert if tables are empty)
-- ============================================================

-- User Auth Service Sample Data
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users LIMIT 1) THEN
        -- BCrypt hash for "password123" - generated using BCryptPasswordEncoder with strength 10
        INSERT INTO users (email, password_hash, full_name, phone_number, date_of_birth, gender, is_email_verified, role) VALUES
        ('admin@quiz.com', '$2a$10$uIUc5bo3gZIND8bRLFolceQVC2etSPWbD.rjNE8NIpOQQ6cUQBifO', 'Admin User', '0901234567', '1990-01-15', 'MALE', true, 'ADMIN'),
        ('teacher1@quiz.com', '$2a$10$uIUc5bo3gZIND8bRLFolceQVC2etSPWbD.rjNE8NIpOQQ6cUQBifO', 'Nguyen Van A', '0912345678', '1985-03-20', 'MALE', true, 'USER'),
        ('teacher2@quiz.com', '$2a$10$uIUc5bo3gZIND8bRLFolceQVC2etSPWbD.rjNE8NIpOQQ6cUQBifO', 'Tran Thi B', '0923456789', '1988-07-10', 'FEMALE', true, 'USER'),
        ('student1@quiz.com', '$2a$10$uIUc5bo3gZIND8bRLFolceQVC2etSPWbD.rjNE8NIpOQQ6cUQBifO', 'Le Hoang C', '0934567890', '2005-05-15', 'MALE', true, 'USER'),
        ('student2@quiz.com', '$2a$10$uIUc5bo3gZIND8bRLFolceQVC2etSPWbD.rjNE8NIpOQQ6cUQBifO', 'Pham Thi D', '0945678901', '2006-08-20', 'FEMALE', true, 'USER'),
        ('student3@quiz.com', '$2a$10$uIUc5bo3gZIND8bRLFolceQVC2etSPWbD.rjNE8NIpOQQ6cUQBifO', 'Hoang Van E', '0956789012', '2005-11-25', 'MALE', true, 'USER');
    END IF;
END $$;

-- Quiz Service Sample Data
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM quizzes LIMIT 1) THEN
        INSERT INTO quizzes (title, description, total_score, duration_minutes, max_attempts, visibility, topic, difficulty, creator_id) VALUES
        ('Basic Math Quiz', 'Test your basic math skills', 100, 30, 3, 'PUBLIC', 'Mathematics', 'EASY', 2),
        ('Advanced Physics', 'Challenging physics problems', 150, 60, 1, 'PRIVATE', 'Physics', 'HARD', 2),
        ('English Grammar', 'Test your grammar knowledge', 80, 20, 2, 'PUBLIC', 'English', 'MEDIUM', 3);
        
        INSERT INTO questions (quiz_id, type, content, options, correct_answer, score, difficulty) VALUES
        (1, 'MULTIPLE_CHOICE', 'What is 2 + 2?', 
         '["3", "4", "5", "6"]'::jsonb, 
         '"4"'::jsonb, 10, 'EASY'),
        (1, 'MULTIPLE_CHOICE', 'What is 10 x 5?', 
         '["40", "45", "50", "55"]'::jsonb, 
         '"50"'::jsonb, 10, 'EASY'),
        (2, 'MULTIPLE_CHOICE', 'What is the speed of light?', 
         '["299,792,458 m/s", "300,000,000 m/s", "250,000,000 m/s", "350,000,000 m/s"]'::jsonb, 
         '"299,792,458 m/s"'::jsonb, 20, 'HARD'),
        (3, 'MULTIPLE_CHOICE', 'Which is correct?', 
         '["He go to school", "He goes to school", "He going to school", "He gone to school"]'::jsonb, 
         '"He goes to school"'::jsonb, 15, 'MEDIUM');
    END IF;
END $$;

-- Notification Service Sample Data
DO $$
BEGIN
    -- Insert templates (check if using templates or email_templates table)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'templates') THEN
        IF NOT EXISTS (SELECT 1 FROM templates LIMIT 1) THEN
            INSERT INTO templates (name, subject, body_html, body_text, channel) VALUES
            ('user_registered', 'Welcome to Quiz App', 
             '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1>Welcome to Quiz App</h1><p>Hello {{.user_name}},</p><p>Thank you for joining our community. We are excited to have you with us.</p><p>Best regards,<br>The Quiz App Team</p></div>', 
             'Welcome to Quiz App. Thank you for joining our community.', 
             'email'),
            ('password_reset', 'Password Reset Request - Quiz App',
             '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1>Password Reset Request</h1><p>Hello {{.user_name}},</p><p>Click the link below to reset your password:</p><p><a href="{{.reset_url}}">Reset Password</a></p><p>This link will expire in 1 hour.</p><p>If you did not request this, please ignore this email.</p></div>',
             'Password reset request. Click link to reset: {{.reset_url}}',
             'email'),
            ('quiz_assigned', 'New Quiz Assignment - Quiz App',
             '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1>New Quiz Assignment</h1><p>Hello {{.student_name}},</p><p>You have been assigned a new quiz: <strong>{{.quiz_title}}</strong></p><p>Class: {{.class_name}}</p><p>Due date: {{.due_date}}</p><p><a href="{{.quiz_url}}">Start Quiz</a></p></div>',
             'New quiz assigned: {{.quiz_title}}. Due: {{.due_date}}',
             'email'),
            ('quiz_result', 'Quiz Result - Quiz App',
             '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1>Quiz Result</h1><p>Hello {{.student_name}},</p><p>Your quiz results are ready!</p><p>Quiz: <strong>{{.quiz_title}}</strong></p><p>Score: <strong>{{.score}}/{{.max_score}}</strong></p><p><a href="{{.result_url}}">View Details</a></p></div>',
             'Quiz result: {{.quiz_title}}. Score: {{.score}}/{{.max_score}}',
             'email');
        END IF;
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_templates') THEN
        IF NOT EXISTS (SELECT 1 FROM email_templates LIMIT 1) THEN
            INSERT INTO email_templates (name, subject, body_html, body_text, channel) VALUES
            ('user_registered', 'Welcome to Quiz App', 
             '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1>Welcome to Quiz App</h1><p>Hello {{.user_name}},</p><p>Thank you for joining our community. We are excited to have you with us.</p><p>Best regards,<br>The Quiz App Team</p></div>', 
             'Welcome to Quiz App. Thank you for joining our community.', 
             'email'),
            ('password_reset', 'Password Reset Request - Quiz App',
             '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1>Password Reset Request</h1><p>Hello {{.user_name}},</p><p>Click the link below to reset your password:</p><p><a href="{{.reset_url}}">Reset Password</a></p><p>This link will expire in 1 hour.</p><p>If you did not request this, please ignore this email.</p></div>',
             'Password reset request. Click link to reset: {{.reset_url}}',
             'email'),
            ('quiz_assigned', 'New Quiz Assignment - Quiz App',
             '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1>New Quiz Assignment</h1><p>Hello {{.student_name}},</p><p>You have been assigned a new quiz: <strong>{{.quiz_title}}</strong></p><p>Class: {{.class_name}}</p><p>Due date: {{.due_date}}</p><p><a href="{{.quiz_url}}">Start Quiz</a></p></div>',
             'New quiz assigned: {{.quiz_title}}. Due: {{.due_date}}',
             'email'),
            ('quiz_result', 'Quiz Result - Quiz App',
             '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1>Quiz Result</h1><p>Hello {{.student_name}},</p><p>Your quiz results are ready!</p><p>Quiz: <strong>{{.quiz_title}}</strong></p><p>Score: <strong>{{.score}}/{{.max_score}}</strong></p><p><a href="{{.result_url}}">View Details</a></p></div>',
             'Quiz result: {{.quiz_title}}. Score: {{.score}}/{{.max_score}}',
             'email');
        END IF;
    END IF;
    
    -- Insert preferences
    IF NOT EXISTS (SELECT 1 FROM preferences LIMIT 1) THEN
        INSERT INTO preferences (user_id, channel, enabled, frequency) VALUES
        (1, 'email', TRUE, 'immediate'),
        (1, 'push', TRUE, 'immediate'),
        (2, 'email', TRUE, 'immediate'),
        (2, 'push', TRUE, 'immediate'),
        (3, 'email', TRUE, 'immediate'),
        (3, 'push', FALSE, 'immediate'),
        (4, 'email', TRUE, 'immediate'),
        (4, 'push', TRUE, 'immediate'),
        (5, 'email', TRUE, 'daily'),
        (5, 'push', TRUE, 'immediate'),
        (6, 'email', TRUE, 'immediate'),
        (6, 'push', TRUE, 'immediate');
    END IF;
END $$;

-- Class Assignment Service Sample Data
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM classes LIMIT 1) THEN
        INSERT INTO classes (name, description, topic, status, teacher_id, invitation_code) VALUES
        ('Math 101', 'Basic Mathematics Course', 'Mathematics', 'ACTIVE', 2, 'MATH101ABC'),
        ('Physics Advanced', 'Advanced Physics Course', 'Physics', 'ACTIVE', 2, 'PHYS201XYZ'),
        ('English Grammar', 'English Grammar Course', 'English', 'ACTIVE', 3, 'ENG101DEF');
        
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
        
        INSERT INTO assignments (class_id, quiz_id, title, description, start_time, due_time, allow_multiple_attempts, max_score) VALUES
        (1, 1, 'Weekly Math Quiz', 'Complete this quiz by Friday', NOW(), NOW() + INTERVAL '7 days', TRUE, 100),
        (2, 2, 'Physics Midterm', 'Midterm examination', NOW(), NOW() + INTERVAL '3 days', FALSE, 150),
        (3, 3, 'Grammar Assessment', 'Weekly grammar check', NOW(), NOW() + INTERVAL '5 days', TRUE, 80);
        
        INSERT INTO student_progress (assignment_id, student_id, status, score) VALUES
        (1, 4, 'COMPLETED', 85),
        (1, 5, 'IN_PROGRESS', 0),
        (1, 6, 'NOT_STARTED', 0),
        (2, 4, 'IN_PROGRESS', 0),
        (2, 5, 'NOT_STARTED', 0),
        (3, 4, 'COMPLETED', 75),
        (3, 6, 'NOT_STARTED', 0);
    END IF;
END $$;

