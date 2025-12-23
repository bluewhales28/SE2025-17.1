-- ============================================================
-- ANALYTICS & STATISTICS SERVICE DATABASE SCHEMA
-- Database: analytics_db
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

-- User activity logs
CREATE TABLE user_activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL, -- No FK, validated via Auth Service API
    activity_type VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id BIGINT,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz performance metrics
CREATE TABLE quiz_performance_metrics (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL, -- No FK, validated via Quiz Service API
    total_attempts INT DEFAULT 0,
    total_completions INT DEFAULT 0,
    average_score DECIMAL(5,2),
    average_duration_minutes DECIMAL(10,2),
    pass_rate DECIMAL(5,2),
    difficulty_rating DECIMAL(3,2),
    last_calculated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (quiz_id)
);

-- Class engagement statistics
CREATE TABLE class_engagement_stats (
    id BIGSERIAL PRIMARY KEY,
    class_id BIGINT NOT NULL, -- No FK, validated via Class Service API
    total_students INT DEFAULT 0,
    active_students INT DEFAULT 0,
    total_assignments INT DEFAULT 0,
    completed_assignments INT DEFAULT 0,
    average_completion_rate DECIMAL(5,2),
    average_class_score DECIMAL(5,2),
    last_activity TIMESTAMP,
    last_calculated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (class_id)
);

-- System usage statistics
CREATE TABLE system_usage_stats (
    id BIGSERIAL PRIMARY KEY,
    stat_date DATE NOT NULL UNIQUE,
    total_users INT DEFAULT 0,
    active_users INT DEFAULT 0,
    new_users INT DEFAULT 0,
    total_quizzes_created INT DEFAULT 0,
    total_quizzes_taken INT DEFAULT 0,
    total_classes INT DEFAULT 0,
    total_assignments INT DEFAULT 0,
    total_notifications_sent INT DEFAULT 0,
    peak_concurrent_users INT DEFAULT 0,
    average_session_duration_minutes DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Report snapshots
CREATE TABLE report_snapshots (
    id BIGSERIAL PRIMARY KEY,
    report_type VARCHAR(50) NOT NULL,
    report_period VARCHAR(20) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    data JSONB NOT NULL,
    generated_by BIGINT, -- User who generated the report
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- User performance summary
CREATE TABLE user_performance_summary (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE, -- No FK, validated via Auth Service API
    total_quizzes_taken INT DEFAULT 0,
    total_quizzes_passed INT DEFAULT 0,
    average_score DECIMAL(5,2),
    highest_score DECIMAL(5,2),
    lowest_score DECIMAL(5,2),
    total_study_time_minutes INT DEFAULT 0,
    streak_days INT DEFAULT 0,
    last_activity TIMESTAMP,
    last_calculated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Question analytics
CREATE TABLE question_analytics (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL UNIQUE, -- No FK, validated via Quiz Service API
    quiz_id BIGINT NOT NULL,
    total_attempts INT DEFAULT 0,
    correct_attempts INT DEFAULT 0,
    wrong_attempts INT DEFAULT 0,
    success_rate DECIMAL(5,2),
    average_time_seconds DECIMAL(10,2),
    difficulty_index DECIMAL(3,2),
    discrimination_index DECIMAL(3,2),
    last_calculated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_activity_type ON user_activity_logs(activity_type);
CREATE INDEX idx_user_activity_logs_created_at ON user_activity_logs(created_at);
CREATE INDEX idx_quiz_performance_metrics_quiz_id ON quiz_performance_metrics(quiz_id);
CREATE INDEX idx_class_engagement_stats_class_id ON class_engagement_stats(class_id);
CREATE INDEX idx_system_usage_stats_stat_date ON system_usage_stats(stat_date);
CREATE INDEX idx_report_snapshots_report_type ON report_snapshots(report_type);
CREATE INDEX idx_report_snapshots_period_start ON report_snapshots(period_start);
CREATE INDEX idx_user_performance_summary_user_id ON user_performance_summary(user_id);
CREATE INDEX idx_question_analytics_question_id ON question_analytics(question_id);
CREATE INDEX idx_question_analytics_quiz_id ON question_analytics(quiz_id);

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Sample system usage stats
INSERT INTO system_usage_stats (stat_date, total_users, active_users, new_users, total_quizzes_created, total_quizzes_taken, total_classes, total_assignments, total_notifications_sent, peak_concurrent_users, average_session_duration_minutes) VALUES
(CURRENT_DATE, 6, 4, 0, 3, 12, 3, 3, 25, 3, 15.5),
(CURRENT_DATE - INTERVAL '1 day', 6, 5, 1, 3, 15, 3, 3, 30, 4, 18.2),
(CURRENT_DATE - INTERVAL '2 days', 5, 3, 2, 2, 8, 2, 2, 20, 3, 12.7);

-- Sample user performance summary
INSERT INTO user_performance_summary (user_id, total_quizzes_taken, total_quizzes_passed, average_score, highest_score, lowest_score, total_study_time_minutes, streak_days, last_activity) VALUES
(4, 15, 12, 78.5, 95.0, 60.0, 450, 5, NOW()),
(5, 8, 5, 65.0, 80.0, 45.0, 240, 2, NOW()),
(6, 12, 10, 82.0, 98.0, 70.0, 360, 7, NOW());

-- Sample quiz performance metrics
INSERT INTO quiz_performance_metrics (quiz_id, total_attempts, total_completions, average_score, average_duration_minutes, pass_rate, difficulty_rating, last_calculated) VALUES
(1, 25, 22, 75.5, 18.5, 88.0, 2.5, NOW()),
(2, 10, 8, 68.2, 45.0, 80.0, 4.2, NOW()),
(3, 18, 16, 72.0, 15.0, 88.9, 3.0, NOW());

-- Sample class engagement stats
INSERT INTO class_engagement_stats (class_id, total_students, active_students, total_assignments, completed_assignments, average_completion_rate, average_class_score, last_activity, last_calculated) VALUES
(1, 3, 3, 1, 2, 66.67, 77.5, NOW(), NOW()),
(2, 2, 1, 1, 0, 0.00, 0.00, NOW(), NOW()),
(3, 2, 1, 1, 1, 50.00, 75.0, NOW(), NOW());

-- Sample user activity logs
INSERT INTO user_activity_logs (user_id, activity_type, resource_type, resource_id, details, created_at) VALUES
(4, 'QUIZ_STARTED', 'quiz', 1, '{"quiz_title": "Basic Math Quiz"}'::jsonb, NOW() - INTERVAL '2 hours'),
(4, 'QUIZ_COMPLETED', 'quiz', 1, '{"score": 85, "duration_minutes": 20}'::jsonb, NOW() - INTERVAL '1 hour'),
(5, 'CLASS_JOINED', 'class', 1, '{"class_name": "Math 101"}'::jsonb, NOW() - INTERVAL '1 day'),
(6, 'ASSIGNMENT_SUBMITTED', 'assignment', 3, '{"assignment_title": "Grammar Assessment"}'::jsonb, NOW() - INTERVAL '3 hours');
