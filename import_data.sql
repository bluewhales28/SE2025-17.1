-- ============================================================
-- IMPORT DATA SCRIPT FOR QUIZZ DATABASE
-- File này dùng để import dữ liệu mẫu vào database quizz
-- Chạy sau khi đã tạo schema bằng database_merged.sql
-- ============================================================

-- ============================================================
-- USER AUTH SERVICE - Sample Users Data
-- ============================================================

-- Xóa dữ liệu cũ nếu cần (UNCOMMENT nếu muốn reset)
-- TRUNCATE TABLE password_reset_tokens CASCADE;
-- TRUNCATE TABLE invalid_tokens CASCADE;
-- TRUNCATE TABLE users CASCADE;

-- Insert sample users
-- Password hash cho tất cả users: "password123" (BCrypt strength 10)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@quiz.com') THEN
        INSERT INTO users (email, password_hash, full_name, phone_number, date_of_birth, gender, is_email_verified, role) VALUES
        ('admin@quiz.com', '$2a$10$uIUc5bo3gZIND8bRLFolceQVC2etSPWbD.rjNE8NIpOQQ6cUQBifO', 'Admin User', '0901234567', '1990-01-15', 'MALE', true, 'ADMIN'),
        ('teacher1@quiz.com', '$2a$10$uIUc5bo3gZIND8bRLFolceQVC2etSPWbD.rjNE8NIpOQQ6cUQBifO', 'Nguyen Van A', '0912345678', '1985-03-20', 'MALE', true, 'USER'),
        ('teacher2@quiz.com', '$2a$10$uIUc5bo3gZIND8bRLFolceQVC2etSPWbD.rjNE8NIpOQQ6cUQBifO', 'Tran Thi B', '0923456789', '1988-07-10', 'FEMALE', true, 'USER'),
        ('student1@quiz.com', '$2a$10$uIUc5bo3gZIND8bRLFolceQVC2etSPWbD.rjNE8NIpOQQ6cUQBifO', 'Le Hoang C', '0934567890', '2005-05-15', 'MALE', true, 'USER'),
        ('student2@quiz.com', '$2a$10$uIUc5bo3gZIND8bRLFolceQVC2etSPWbD.rjNE8NIpOQQ6cUQBifO', 'Pham Thi D', '0945678901', '2006-08-20', 'FEMALE', true, 'USER'),
        ('student3@quiz.com', '$2a$10$uIUc5bo3gZIND8bRLFolceQVC2etSPWbD.rjNE8NIpOQQ6cUQBifO', 'Hoang Van E', '0956789012', '2005-11-25', 'MALE', true, 'USER');
        
        RAISE NOTICE 'Inserted sample users';
    ELSE
        RAISE NOTICE 'Users already exist, skipping user insertion';
    END IF;
END $$;

-- ============================================================
-- QUIZ SERVICE - Sample Quizzes and Questions Data
-- ============================================================

-- Xóa dữ liệu cũ nếu cần (UNCOMMENT nếu muốn reset)
-- TRUNCATE TABLE attempt_answers CASCADE;
-- TRUNCATE TABLE attempts CASCADE;
-- TRUNCATE TABLE questions CASCADE;
-- TRUNCATE TABLE quizzes CASCADE;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM quizzes LIMIT 1) THEN
        -- Insert quizzes
        INSERT INTO quizzes (title, description, total_score, duration_minutes, max_attempts, visibility, topic, difficulty, creator_id) VALUES
        ('Basic Math Quiz', 'Test your basic math skills', 100, 30, 3, 'PUBLIC', 'Mathematics', 'EASY', 2),
        ('Advanced Physics', 'Challenging physics problems', 150, 60, 1, 'PRIVATE', 'Physics', 'HARD', 2),
        ('English Grammar', 'Test your grammar knowledge', 80, 20, 2, 'PUBLIC', 'English', 'MEDIUM', 3),
        ('Computer Science Basics', 'Fundamental CS concepts', 120, 45, 2, 'PUBLIC', 'Computer Science', 'MEDIUM', 2),
        ('History Quiz', 'World history questions', 90, 25, 2, 'PUBLIC', 'History', 'EASY', 3);
        
        -- Insert questions for quiz 1 (Basic Math Quiz)
        INSERT INTO questions (quiz_id, type, content, options, correct_answer, score, difficulty) VALUES
        (1, 'MULTIPLE_CHOICE', 'What is 2 + 2?', 
         '["3", "4", "5", "6"]'::jsonb, 
         '"4"'::jsonb, 10, 'EASY'),
        (1, 'MULTIPLE_CHOICE', 'What is 10 x 5?', 
         '["40", "45", "50", "55"]'::jsonb, 
         '"50"'::jsonb, 10, 'EASY'),
        (1, 'MULTIPLE_CHOICE', 'What is 15 - 7?', 
         '["6", "7", "8", "9"]'::jsonb, 
         '"8"'::jsonb, 10, 'EASY'),
        (1, 'MULTIPLE_CHOICE', 'What is 100 / 4?', 
         '["20", "25", "30", "35"]'::jsonb, 
         '"25"'::jsonb, 10, 'EASY'),
        (1, 'TRUE_FALSE', '2 + 2 = 5', 
         '["True", "False"]'::jsonb, 
         '"False"'::jsonb, 10, 'EASY');
        
        -- Insert questions for quiz 2 (Advanced Physics)
        INSERT INTO questions (quiz_id, type, content, options, correct_answer, score, difficulty) VALUES
        (2, 'MULTIPLE_CHOICE', 'What is the speed of light?', 
         '["299,792,458 m/s", "300,000,000 m/s", "250,000,000 m/s", "350,000,000 m/s"]'::jsonb, 
         '"299,792,458 m/s"'::jsonb, 30, 'HARD'),
        (2, 'MULTIPLE_CHOICE', 'What is E = mc²?', 
         '["Einstein equation", "Newton law", "Ohm law", "Pascal principle"]'::jsonb, 
         '"Einstein equation"'::jsonb, 30, 'HARD'),
        (2, 'MULTIPLE_CHOICE', 'What is the unit of force?', 
         '["Newton", "Joule", "Watt", "Pascal"]'::jsonb, 
         '"Newton"'::jsonb, 30, 'MEDIUM'),
        (2, 'ESSAY', 'Explain the theory of relativity', 
         NULL::jsonb, 
         NULL::jsonb, 60, 'HARD');
        
        -- Insert questions for quiz 3 (English Grammar)
        INSERT INTO questions (quiz_id, type, content, options, correct_answer, score, difficulty) VALUES
        (3, 'MULTIPLE_CHOICE', 'Which is correct?', 
         '["He go to school", "He goes to school", "He going to school", "He gone to school"]'::jsonb, 
         '"He goes to school"'::jsonb, 20, 'MEDIUM'),
        (3, 'MULTIPLE_CHOICE', 'Choose the correct past tense of "eat"', 
         '["eated", "ate", "eaten", "eating"]'::jsonb, 
         '"ate"'::jsonb, 20, 'MEDIUM'),
        (3, 'MULTIPLE_CHOICE', 'Which sentence is grammatically correct?', 
         '["I am go to school", "I am going to school", "I go to school yesterday", "I going to school"]'::jsonb, 
         '"I am going to school"'::jsonb, 20, 'MEDIUM'),
        (3, 'TRUE_FALSE', 'The word "quickly" is an adjective', 
         '["True", "False"]'::jsonb, 
         '"False"'::jsonb, 20, 'EASY');
        
        -- Insert questions for quiz 4 (Computer Science Basics)
        INSERT INTO questions (quiz_id, type, content, options, correct_answer, score, difficulty) VALUES
        (4, 'MULTIPLE_CHOICE', 'What does CPU stand for?', 
         '["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Computer Processing Unit"]'::jsonb, 
         '"Central Processing Unit"'::jsonb, 20, 'EASY'),
        (4, 'MULTIPLE_CHOICE', 'What is the time complexity of binary search?', 
         '["O(n)", "O(log n)", "O(n²)", "O(1)"]'::jsonb, 
         '"O(log n)"'::jsonb, 30, 'MEDIUM'),
        (4, 'MULTIPLE_CHOICE', 'What is a primary key?', 
         '["A unique identifier", "A foreign key", "An index", "A constraint"]'::jsonb, 
         '"A unique identifier"'::jsonb, 20, 'EASY'),
        (4, 'ESSAY', 'Explain the difference between stack and queue', 
         NULL::jsonb, 
         NULL::jsonb, 50, 'MEDIUM');
        
        -- Insert questions for quiz 5 (History Quiz)
        INSERT INTO questions (quiz_id, type, content, options, correct_answer, score, difficulty) VALUES
        (5, 'MULTIPLE_CHOICE', 'When did World War II end?', 
         '["1943", "1944", "1945", "1946"]'::jsonb, 
         '"1945"'::jsonb, 20, 'EASY'),
        (5, 'MULTIPLE_CHOICE', 'Who was the first President of the United States?', 
         '["Thomas Jefferson", "George Washington", "John Adams", "Benjamin Franklin"]'::jsonb, 
         '"George Washington"'::jsonb, 20, 'EASY'),
        (5, 'MULTIPLE_CHOICE', 'In which year did the Berlin Wall fall?', 
         '["1987", "1988", "1989", "1990"]'::jsonb, 
         '"1989"'::jsonb, 25, 'MEDIUM'),
        (5, 'TRUE_FALSE', 'The Renaissance began in Italy', 
         '["True", "False"]'::jsonb, 
         '"True"'::jsonb, 25, 'EASY');
        
        RAISE NOTICE 'Inserted sample quizzes and questions';
    ELSE
        RAISE NOTICE 'Quizzes already exist, skipping quiz insertion';
    END IF;
END $$;

-- ============================================================
-- NOTIFICATION SERVICE - Sample Templates and Preferences
-- ============================================================

DO $$
BEGIN
    -- Insert email templates
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'templates') THEN
        IF NOT EXISTS (SELECT 1 FROM templates WHERE name = 'user_registered') THEN
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
            
            RAISE NOTICE 'Inserted email templates';
        END IF;
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_templates') THEN
        IF NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'user_registered') THEN
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
            
            RAISE NOTICE 'Inserted email templates';
        END IF;
    END IF;
    
    -- Insert user preferences
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
        
        RAISE NOTICE 'Inserted user preferences';
    END IF;
END $$;

-- ============================================================
-- CLASS ASSIGNMENT SERVICE - Sample Classes, Members, Assignments
-- ============================================================

-- Xóa dữ liệu cũ nếu cần (UNCOMMENT nếu muốn reset)
-- TRUNCATE TABLE student_progress CASCADE;
-- TRUNCATE TABLE assignments CASCADE;
-- TRUNCATE TABLE class_members CASCADE;
-- TRUNCATE TABLE classes CASCADE;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM classes LIMIT 1) THEN
        -- Insert classes
        INSERT INTO classes (name, description, topic, status, teacher_id, invitation_code) VALUES
        ('Math 101', 'Basic Mathematics Course', 'Mathematics', 'ACTIVE', 2, 'MATH101ABC'),
        ('Physics Advanced', 'Advanced Physics Course', 'Physics', 'ACTIVE', 2, 'PHYS201XYZ'),
        ('English Grammar', 'English Grammar Course', 'English', 'ACTIVE', 3, 'ENG101DEF'),
        ('Computer Science 101', 'Introduction to Computer Science', 'Computer Science', 'ACTIVE', 2, 'CS101GHI'),
        ('History 101', 'World History Course', 'History', 'ACTIVE', 3, 'HIST101JKL');
        
        -- Insert class members
        INSERT INTO class_members (class_id, user_id, role) VALUES
        -- Math 101 class members
        (1, 2, 'TEACHER'),
        (1, 4, 'STUDENT'),
        (1, 5, 'STUDENT'),
        (1, 6, 'STUDENT'),
        -- Physics Advanced class members
        (2, 2, 'TEACHER'),
        (2, 4, 'STUDENT'),
        (2, 5, 'STUDENT'),
        -- English Grammar class members
        (3, 3, 'TEACHER'),
        (3, 4, 'STUDENT'),
        (3, 6, 'STUDENT'),
        -- Computer Science 101 class members
        (4, 2, 'TEACHER'),
        (4, 4, 'STUDENT'),
        (4, 5, 'STUDENT'),
        (4, 6, 'STUDENT'),
        -- History 101 class members
        (5, 3, 'TEACHER'),
        (5, 4, 'STUDENT'),
        (5, 5, 'STUDENT');
        
        -- Insert assignments
        INSERT INTO assignments (class_id, quiz_id, title, description, start_time, due_time, allow_multiple_attempts, max_score, max_attempts) VALUES
        (1, 1, 'Weekly Math Quiz', 'Complete this quiz by Friday', NOW(), NOW() + INTERVAL '7 days', TRUE, 100, 3),
        (2, 2, 'Physics Midterm', 'Midterm examination', NOW(), NOW() + INTERVAL '3 days', FALSE, 150, 1),
        (3, 3, 'Grammar Assessment', 'Weekly grammar check', NOW(), NOW() + INTERVAL '5 days', TRUE, 80, 2),
        (4, 4, 'CS Basics Assignment', 'Complete the CS basics quiz', NOW(), NOW() + INTERVAL '10 days', TRUE, 120, 2),
        (5, 5, 'History Quiz Assignment', 'World history quiz', NOW(), NOW() + INTERVAL '6 days', TRUE, 90, 2);
        
        -- Insert student progress
        INSERT INTO student_progress (assignment_id, student_id, status, score) VALUES
        -- Math 101 progress
        (1, 4, 'COMPLETED', 85),
        (1, 5, 'IN_PROGRESS', 0),
        (1, 6, 'NOT_STARTED', 0),
        -- Physics Advanced progress
        (2, 4, 'IN_PROGRESS', 0),
        (2, 5, 'NOT_STARTED', 0),
        -- English Grammar progress
        (3, 4, 'COMPLETED', 75),
        (3, 6, 'NOT_STARTED', 0),
        -- CS Basics progress
        (4, 4, 'COMPLETED', 95),
        (4, 5, 'IN_PROGRESS', 0),
        (4, 6, 'NOT_STARTED', 0),
        -- History progress
        (5, 4, 'COMPLETED', 88),
        (5, 5, 'NOT_STARTED', 0);
        
        RAISE NOTICE 'Inserted sample classes, members, assignments, and progress';
    ELSE
        RAISE NOTICE 'Classes already exist, skipping class insertion';
    END IF;
END $$;

-- ============================================================
-- QUIZ ATTEMPTS - Sample Attempt Data
-- ============================================================

DO $$
DECLARE
    attempt_id_var BIGINT;
BEGIN
    -- Insert sample attempts (only if they don't exist)
    IF NOT EXISTS (SELECT 1 FROM attempts LIMIT 1) THEN
        -- Student 4 completed Math Quiz
        INSERT INTO attempts (user_id, quiz_id, start_time, end_time, score, is_submitted, shuffle_seed)
        VALUES (4, 1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '25 minutes', 85, TRUE, 12345)
        RETURNING id INTO attempt_id_var;
        
        -- Insert answers for the attempt
        INSERT INTO attempt_answers (attempt_id, question_id, answer, is_correct) VALUES
        (attempt_id_var, 1, '"4"'::jsonb, TRUE),
        (attempt_id_var, 2, '"50"'::jsonb, TRUE),
        (attempt_id_var, 3, '"8"'::jsonb, TRUE),
        (attempt_id_var, 4, '"25"'::jsonb, TRUE),
        (attempt_id_var, 5, '"False"'::jsonb, TRUE);
        
        -- Student 4 completed English Grammar Quiz
        INSERT INTO attempts (user_id, quiz_id, start_time, end_time, score, is_submitted, shuffle_seed)
        VALUES (4, 3, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '18 minutes', 75, TRUE, 54321)
        RETURNING id INTO attempt_id_var;
        
        INSERT INTO attempt_answers (attempt_id, question_id, answer, is_correct) VALUES
        (attempt_id_var, 11, '"He goes to school"'::jsonb, TRUE),
        (attempt_id_var, 12, '"ate"'::jsonb, TRUE),
        (attempt_id_var, 13, '"I am going to school"'::jsonb, TRUE),
        (attempt_id_var, 14, '"False"'::jsonb, TRUE);
        
        -- Student 4 completed CS Basics Quiz
        INSERT INTO attempts (user_id, quiz_id, start_time, end_time, score, is_submitted, shuffle_seed)
        VALUES (4, 4, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '40 minutes', 95, TRUE, 98765)
        RETURNING id INTO attempt_id_var;
        
        INSERT INTO attempt_answers (attempt_id, question_id, answer, is_correct) VALUES
        (attempt_id_var, 15, '"Central Processing Unit"'::jsonb, TRUE),
        (attempt_id_var, 16, '"O(log n)"'::jsonb, TRUE),
        (attempt_id_var, 17, '"A unique identifier"'::jsonb, TRUE);
        
        -- Student 4 completed History Quiz
        INSERT INTO attempts (user_id, quiz_id, start_time, end_time, score, is_submitted, shuffle_seed)
        VALUES (4, 5, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '22 minutes', 88, TRUE, 11111)
        RETURNING id INTO attempt_id_var;
        
        INSERT INTO attempt_answers (attempt_id, question_id, answer, is_correct) VALUES
        (attempt_id_var, 19, '"1945"'::jsonb, TRUE),
        (attempt_id_var, 20, '"George Washington"'::jsonb, TRUE),
        (attempt_id_var, 21, '"1989"'::jsonb, TRUE),
        (attempt_id_var, 22, '"True"'::jsonb, TRUE);
        
        RAISE NOTICE 'Inserted sample quiz attempts and answers';
    ELSE
        RAISE NOTICE 'Attempts already exist, skipping attempt insertion';
    END IF;
END $$;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Kiểm tra số lượng records đã insert
DO $$
DECLARE
    user_count INT;
    quiz_count INT;
    question_count INT;
    class_count INT;
    assignment_count INT;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO quiz_count FROM quizzes;
    SELECT COUNT(*) INTO question_count FROM questions;
    SELECT COUNT(*) INTO class_count FROM classes;
    SELECT COUNT(*) INTO assignment_count FROM assignments;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATA IMPORT SUMMARY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Users: %', user_count;
    RAISE NOTICE 'Quizzes: %', quiz_count;
    RAISE NOTICE 'Questions: %', question_count;
    RAISE NOTICE 'Classes: %', class_count;
    RAISE NOTICE 'Assignments: %', assignment_count;
    RAISE NOTICE '========================================';
END $$;

-- ============================================================
-- END OF IMPORT SCRIPT
-- ============================================================

