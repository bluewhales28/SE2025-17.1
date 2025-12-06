-- ============================================================
-- RECOMMENDATION SERVICE DATABASE SCHEMA
-- Database: recommendation_db
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

-- User learning profiles
CREATE TABLE user_learning_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE, -- No FK, validated via Auth Service API
    learning_style VARCHAR(50),
    preferred_difficulty VARCHAR(20),
    strong_topics TEXT[],
    weak_topics TEXT[],
    average_score DECIMAL(5,2),
    total_quizzes_taken INT DEFAULT 0,
    last_activity TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Quiz recommendations
CREATE TABLE quiz_recommendations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL, -- No FK, validated via Auth Service API
    quiz_id BIGINT NOT NULL, -- No FK, validated via Quiz Service API
    recommendation_score DECIMAL(5,2) NOT NULL,
    reason TEXT,
    is_accepted BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- Skill assessments
CREATE TABLE skill_assessments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL, -- No FK, validated via Auth Service API
    topic VARCHAR(100) NOT NULL,
    skill_level VARCHAR(20),
    proficiency_score DECIMAL(5,2),
    quizzes_completed INT DEFAULT 0,
    last_assessed TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, topic)
);

-- Learning paths
CREATE TABLE learning_paths (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL, -- No FK, validated via Auth Service API
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_topic VARCHAR(100),
    recommended_quizzes JSONB, -- Array of quiz IDs in order
    current_step INT DEFAULT 0,
    total_steps INT,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Recommendation logs
CREATE TABLE recommendation_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL, -- No FK, validated via Auth Service API
    recommendation_type VARCHAR(50) NOT NULL,
    recommended_items JSONB,
    algorithm_used VARCHAR(100),
    confidence_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_learning_profiles_user_id ON user_learning_profiles(user_id);
CREATE INDEX idx_quiz_recommendations_user_id ON quiz_recommendations(user_id);
CREATE INDEX idx_quiz_recommendations_quiz_id ON quiz_recommendations(quiz_id);
CREATE INDEX idx_quiz_recommendations_created_at ON quiz_recommendations(created_at);
CREATE INDEX idx_skill_assessments_user_id ON skill_assessments(user_id);
CREATE INDEX idx_skill_assessments_topic ON skill_assessments(topic);
CREATE INDEX idx_learning_paths_user_id ON learning_paths(user_id);
CREATE INDEX idx_learning_paths_status ON learning_paths(status);
CREATE INDEX idx_recommendation_logs_user_id ON recommendation_logs(user_id);
CREATE INDEX idx_recommendation_logs_created_at ON recommendation_logs(created_at);

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Sample user learning profiles
INSERT INTO user_learning_profiles (user_id, learning_style, preferred_difficulty, strong_topics, weak_topics, average_score, total_quizzes_taken, last_activity) VALUES
(4, 'visual', 'MEDIUM', ARRAY['Mathematics', 'Logic'], ARRAY['Physics'], 78.5, 15, NOW()),
(5, 'kinesthetic', 'EASY', ARRAY['English'], ARRAY['Mathematics', 'Science'], 65.0, 8, NOW()),
(6, 'auditory', 'HARD', ARRAY['Science', 'History'], ARRAY['Mathematics'], 82.0, 12, NOW());

-- Sample skill assessments
INSERT INTO skill_assessments (user_id, topic, skill_level, proficiency_score, quizzes_completed, last_assessed) VALUES
(4, 'Mathematics', 'INTERMEDIATE', 78.5, 5, NOW()),
(4, 'Physics', 'BEGINNER', 45.0, 2, NOW()),
(5, 'English', 'INTERMEDIATE', 70.0, 4, NOW()),
(5, 'Mathematics', 'BEGINNER', 55.0, 3, NOW()),
(6, 'Science', 'ADVANCED', 88.0, 6, NOW()),
(6, 'History', 'INTERMEDIATE', 75.0, 4, NOW());

-- Sample quiz recommendations
INSERT INTO quiz_recommendations (user_id, quiz_id, recommendation_score, reason, created_at, expires_at) VALUES
(4, 1, 85.5, 'Based on your strong performance in Mathematics', NOW(), NOW() + INTERVAL '7 days'),
(5, 3, 78.0, 'Recommended to improve your English skills', NOW(), NOW() + INTERVAL '7 days'),
(6, 2, 92.0, 'Perfect match for your advanced Science level', NOW(), NOW() + INTERVAL '7 days');

-- Sample learning paths
INSERT INTO learning_paths (user_id, name, description, target_topic, recommended_quizzes, current_step, total_steps, completion_percentage, status) VALUES
(4, 'Master Basic Math', 'Complete path to master basic mathematics', 'Mathematics', '[1, 2, 3]'::jsonb, 1, 3, 33.33, 'ACTIVE'),
(5, 'English Fundamentals', 'Improve your English grammar and vocabulary', 'English', '[3, 4]'::jsonb, 0, 2, 0.00, 'ACTIVE'),
(6, 'Advanced Science Track', 'Deep dive into advanced scientific concepts', 'Science', '[2, 5, 6]'::jsonb, 1, 3, 33.33, 'ACTIVE');
