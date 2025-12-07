-- Email templates for notification service
\c quizz

-- Insert email templates (skip if already exists)
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
 'email')
ON CONFLICT (name) DO NOTHING;
