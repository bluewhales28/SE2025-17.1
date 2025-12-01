-- ENUM định nghĩa
CREATE TYPE gender_enum AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE role_enum AS ENUM ('USER', 'TEACHER', 'ADMIN');
CREATE TYPE quiz_visibility_enum AS ENUM ('PUBLIC', 'PRIVATE');
CREATE TYPE question_type_enum AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'ESSAY');
CREATE TYPE difficulty_enum AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE class_role_enum AS ENUM ('TEACHER', 'STUDENT', 'TA');

-- Bảng người dùng
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    gender gender_enum,
    is_email_verified BOOLEAN DEFAULT FALSE,
    role role_enum DEFAULT 'USER',
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

-- Báo cáo & dữ liệu tổng hợp
CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    report_type VARCHAR(50),
    reference_id BIGINT,
    metadata JSONB,
    pdf_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Cache dữ liệu thống kê
CREATE TABLE analytics_cache (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE,
    data JSONB,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Bảng cảnh báo (alert)
CREATE TABLE alerts (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(100),
    description TEXT,
    severity VARCHAR(20),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Thông báo người dùng (chỉ email)
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP,
    error_message TEXT,
    attempts INT DEFAULT 0,
    metadata_json JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Template email
CREATE TABLE email_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);






-- 1. Thêm Users (quan trọng - cần có để test)
INSERT INTO users (email, password_hash, full_name, phone_number, date_of_birth, gender, is_email_verified, role) VALUES
('admin@quiz.com', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890', 'Admin User', '0901234567', '1990-01-15', 'MALE', true, 'ADMIN'),
('teacher1@quiz.com', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890', 'Nguyễn Văn A', '0912345678', '1985-03-20', 'MALE', true, 'TEACHER'),
('teacher2@quiz.com', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890', 'Trần Thị B', '0923456789', '1988-07-10', 'FEMALE', true, 'TEACHER'),
('student1@quiz.com', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890', 'Lê Hoàng C', '0934567890', '2005-05-15', 'MALE', true, 'USER'),
('student2@quiz.com', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890', 'Phạm Thị D', '0945678901', '2006-08-20', 'FEMALE', true, 'USER'),
('student3@quiz.com', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890', 'Hoàng Văn E', '0956789012', '2005-11-25', 'MALE', false, 'USER');

-- 2. Thêm Quizzes (quan trọng - nội dung chính)
INSERT INTO quizzes (title, description, total_score, duration_minutes, max_attempts, visibility, topic, difficulty, tags, creator_id) VALUES
('Toán học cơ bản lớp 10', 'Bài kiểm tra về đại số và hình học', 100, 45, 2, 'PUBLIC', 'Toán học', 'EASY', ARRAY['toán', 'đại số', 'hình học'], 2),
('Vật lý nâng cao', 'Kiểm tra chuyên đề cơ học', 100, 60, 1, 'PUBLIC', 'Vật lý', 'HARD', ARRAY['vật lý', 'cơ học'], 2),
('Tiếng Anh Grammar', 'Ngữ pháp tiếng Anh trình độ B1', 50, 30, 3, 'PUBLIC', 'Tiếng Anh', 'MEDIUM', ARRAY['english', 'grammar'], 3);

-- 3. Thêm Questions (quan trọng - nội dung quiz)
INSERT INTO questions (quiz_id, type, content, options, correct_answer, score, difficulty, tags) VALUES
-- Quiz 1: Toán học
(1, 'MULTIPLE_CHOICE', 'Nghiệm của phương trình x² - 5x + 6 = 0 là?', 
 '["x = 2 hoặc x = 3", "x = 1 hoặc x = 6", "x = -2 hoặc x = -3", "x = 0 hoặc x = 5"]'::jsonb,
 '["x = 2 hoặc x = 3"]'::jsonb, 10, 'EASY', ARRAY['đại số', 'phương trình']),

(1, 'MULTIPLE_CHOICE', 'Diện tích hình tròn bán kính 5cm là?',
 '["25π cm²", "10π cm²", "5π cm²", "50π cm²"]'::jsonb,
 '["25π cm²"]'::jsonb, 10, 'EASY', ARRAY['hình học', 'diện tích']),

(1, 'TRUE_FALSE', 'Sin²x + Cos²x = 1 với mọi x',
 '["Đúng", "Sai"]'::jsonb,
 '["Đúng"]'::jsonb, 5, 'EASY', ARRAY['lượng giác']),

-- Quiz 2: Vật lý
(2, 'MULTIPLE_CHOICE', 'Công thức tính động năng là?',
 '["Wđ = 1/2 mv²", "Wđ = mgh", "Wđ = Fs", "Wđ = mv"]'::jsonb,
 '["Wđ = 1/2 mv²"]'::jsonb, 20, 'MEDIUM', ARRAY['cơ học', 'năng lượng']),

(2, 'TRUE_FALSE', 'Trong chân không, mọi vật rơi tự do với cùng gia tốc g',
 '["Đúng", "Sai"]'::jsonb,
 '["Đúng"]'::jsonb, 10, 'EASY', ARRAY['rơi tự do']),

-- Quiz 3: Tiếng Anh
(3, 'MULTIPLE_CHOICE', 'Choose the correct form: She ___ to school every day.',
 '["goes", "go", "going", "gone"]'::jsonb,
 '["goes"]'::jsonb, 10, 'EASY', ARRAY['grammar', 'present simple']),

(3, 'MULTIPLE_CHOICE', 'Which sentence is correct?',
 '["I have been living here for 5 years", "I am living here for 5 years", "I live here for 5 years", "I lived here for 5 years"]'::jsonb,
 '["I have been living here for 5 years"]'::jsonb, 15, 'MEDIUM', ARRAY['present perfect']);

-- 4. Thêm Classes (quan trọng - tổ chức lớp học)
INSERT INTO classes (name, description, topic, status, teacher_id, invitation_code) VALUES
('Lớp Toán 10A1', 'Lớp toán nâng cao khối 10', 'Toán học', 'ACTIVE', 2, 'MATH10A1'),
('Lớp Vật lý 11', 'Chuyên đề Vật lý 11', 'Vật lý', 'ACTIVE', 2, 'PHYSICS11'),
('English B1 Class', 'Lớp tiếng Anh trung cấp', 'Tiếng Anh', 'ACTIVE', 3, 'ENGLISHB1');

-- 5. Thêm Class Members (quan trọng - học sinh trong lớp)
INSERT INTO class_members (class_id, user_id, role) VALUES
-- Lớp Toán 10A1
(1, 2, 'TEACHER'),
(1, 4, 'STUDENT'),
(1, 5, 'STUDENT'),
(1, 6, 'STUDENT'),

-- Lớp Vật lý 11
(2, 2, 'TEACHER'),
(2, 4, 'STUDENT'),

-- English B1 Class
(3, 3, 'TEACHER'),
(3, 5, 'STUDENT'),
(3, 6, 'STUDENT');

-- 6. Thêm Assignments (quan trọng - giao bài)
INSERT INTO assignments (class_id, quiz_id, title, description, start_time, due_time, allow_multiple_attempts, max_score) VALUES
(1, 1, 'Bài tập tuần 1 - Toán cơ bản', 'Hoàn thành bài kiểm tra trong tuần này', 
 NOW() - INTERVAL '3 days', NOW() + INTERVAL '4 days', true, 100),

(2, 2, 'Bài tập Cơ học', 'Làm bài kiểm tra về cơ học',
 NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', false, 100),

(3, 3, 'Grammar Exercise Week 2', 'Weekly grammar practice',
 NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days', true, 50);

-- 7. Thêm Email Templates (quan trọng - để test gửi email)
INSERT INTO email_templates (name, type, subject, body_html, body_text, variables, is_active) VALUES
('quiz_assigned', 'ASSIGNMENT', 'Bạn có bài tập mới: {{quiz_title}}',
 '<h2>Xin chào {{user_name}},</h2><p>Bạn được giao bài tập: <strong>{{quiz_title}}</strong></p><p>Lớp: {{class_name}}</p><p>Hạn nộp: {{due_date}}</p><p><a href="{{quiz_link}}">Làm bài ngay</a></p>',
 'Xin chào {{user_name}}, Bạn được giao bài tập: {{quiz_title}}. Lớp: {{class_name}}. Hạn nộp: {{due_date}}',
 '["user_name", "quiz_title", "due_date", "class_name", "quiz_link"]'::jsonb, true),

('quiz_reminder', 'REMINDER', 'Nhắc nhở: Bài tập {{quiz_title}} sắp hết hạn',
 '<h2>Xin chào {{user_name}},</h2><p>Bài tập <strong>{{quiz_title}}</strong> sẽ hết hạn vào {{due_date}}</p><p>Còn {{hours_left}} giờ nữa!</p>',
 'Xin chào {{user_name}}, Bài tập {{quiz_title}} sẽ hết hạn vào {{due_date}}. Còn {{hours_left}} giờ nữa!',
 '["user_name", "quiz_title", "due_date", "hours_left"]'::jsonb, true),

('quiz_graded', 'NOTIFICATION', 'Bài làm của bạn đã được chấm điểm',
 '<h2>Xin chào {{user_name}},</h2><p>Bài làm <strong>{{quiz_title}}</strong> đã được chấm.</p><p>Điểm: <strong>{{score}}/{{max_score}}</strong></p>',
 'Xin chào {{user_name}}, Bài làm {{quiz_title}} đã được chấm. Điểm: {{score}}/{{max_score}}',
 '["user_name", "quiz_title", "score", "max_score"]'::jsonb, true),

('welcome', 'WELCOME', 'Chào mừng đến với Quiz Platform!',
 '<h1>Chào mừng {{user_name}}!</h1><p>Cảm ơn bạn đã đăng ký tài khoản.</p><p>Email của bạn: {{user_email}}</p>',
 'Chào mừng {{user_name}}! Cảm ơn bạn đã đăng ký tài khoản. Email: {{user_email}}',
 '["user_name", "user_email"]'::jsonb, true);

-- 8. Thêm Notifications chưa gửi (quan trọng - để test RabbitMQ worker)
INSERT INTO notifications (user_id, type, title, content, is_sent, metadata_json) VALUES
-- Notification chưa gửi - để test worker
(4, 'ASSIGNMENT', 'Bài tập mới: Toán học cơ bản', 'Bạn có bài tập mới trong lớp Toán 10A1', false,
 '{"quiz_id": 1, "assignment_id": 1, "template_name": "quiz_assigned", "variables": {"user_name": "Lê Hoàng C", "quiz_title": "Toán học cơ bản lớp 10", "class_name": "Lớp Toán 10A1", "due_date": "2025-11-01", "quiz_link": "https://quiz.com/attempt/1"}}'::jsonb),

(5, 'ASSIGNMENT', 'Bài tập mới: Toán học cơ bản', 'Bạn có bài tập mới trong lớp Toán 10A1', false,
 '{"quiz_id": 1, "assignment_id": 1, "template_name": "quiz_assigned", "variables": {"user_name": "Phạm Thị D", "quiz_title": "Toán học cơ bản lớp 10", "class_name": "Lớp Toán 10A1", "due_date": "2025-11-01", "quiz_link": "https://quiz.com/attempt/1"}}'::jsonb),

(6, 'REMINDER', 'Nhắc nhở: Bài tập sắp hết hạn', 'Bài tập Toán học cơ bản sẽ hết hạn sau 4 ngày', false,
 '{"quiz_id": 1, "assignment_id": 1, "template_name": "quiz_reminder", "variables": {"user_name": "Hoàng Văn E", "quiz_title": "Toán học cơ bản lớp 10", "due_date": "2025-11-01", "hours_left": 96}}'::jsonb);

