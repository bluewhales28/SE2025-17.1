-- ============================================================
-- NOTIFICATION SERVICE DATABASE SCHEMA
-- Database: notification_db
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

-- Notifications table
CREATE TABLE notifications (
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
CREATE TABLE preferences (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL, -- No FK, validated via Auth Service API
    channel VARCHAR(20) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    frequency VARCHAR(20) DEFAULT 'immediate',
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT idx_user_channel UNIQUE (user_id, channel)
);

-- Templates table
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

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_preferences_user_id ON preferences(user_id);
CREATE INDEX idx_templates_name ON templates(name);
CREATE INDEX idx_templates_channel ON templates(channel);

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Sample templates
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

-- Sample preferences (default for all users)
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
