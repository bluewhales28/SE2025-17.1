-- ============================================================
-- QUIZ SERVICE DATABASE SCHEMA
-- Database: quiz_db
-- ============================================================

-- ENUM types
CREATE TYPE quiz_visibility_enum AS ENUM ('PUBLIC', 'PRIVATE');
CREATE TYPE question_type_enum AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'ESSAY');
CREATE TYPE difficulty_enum AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- ============================================================
-- TABLES
-- ============================================================

-- Quizzes table
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
    creator_id BIGINT NOT NULL, -- No FK, validated via Auth Service API
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
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
CREATE TABLE attempts (
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
CREATE TABLE attempt_answers (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer JSONB,
    is_correct BOOLEAN,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_quizzes_creator_id ON quizzes(creator_id);
CREATE INDEX idx_quizzes_visibility ON quizzes(visibility);
CREATE INDEX idx_quizzes_topic ON quizzes(topic);
CREATE INDEX idx_quizzes_difficulty ON quizzes(difficulty);
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_questions_type ON questions(type);
CREATE INDEX idx_attempts_user_id ON attempts(user_id);
CREATE INDEX idx_attempts_quiz_id ON attempts(quiz_id);
CREATE INDEX idx_attempts_submitted ON attempts(is_submitted);
CREATE INDEX idx_attempt_answers_attempt_id ON attempt_answers(attempt_id);
CREATE INDEX idx_attempt_answers_question_id ON attempt_answers(question_id);

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Sample quizzes (creator_id references users from auth service)
INSERT INTO quizzes (title, description, total_score, duration_minutes, max_attempts, visibility, topic, difficulty, creator_id) VALUES
('Basic Math Quiz', 'Test your basic math skills', 100, 30, 3, 'PUBLIC', 'Mathematics', 'EASY', 2),
('Advanced Physics', 'Challenging physics problems', 150, 60, 1, 'PRIVATE', 'Physics', 'HARD', 2),
('English Grammar', 'Test your grammar knowledge', 80, 20, 2, 'PUBLIC', 'English', 'MEDIUM', 3);

-- Sample questions
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
