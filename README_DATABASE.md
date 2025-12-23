# 📊 Database Documentation - Database `quizz`

## 🔗 Thông tin kết nối Database

### Database Details
- **Tên Database:** `quizz`
- **Loại Database:** PostgreSQL
- **Port:** `5432` (mặc định)
- **Host:** 
  - Development/Docker: `postgres` (tên service trong docker-compose)
  - Local: `localhost` hoặc `127.0.0.1`
  - Production: Có thể cấu hình qua biến môi trường `DB_HOST`

### Connection String
```
jdbc:postgresql://${DB_HOST:postgres}:${DB_PORT:5432}/${DB_NAME:quizz}
```

### Thông tin đăng nhập mặc định
- **Username:** `postgres` (có thể thay đổi qua biến môi trường `DB_USER`)
- **Password:** `password` (có thể thay đổi qua biến môi trường `DB_PASSWORD`)

### Biến môi trường
Các biến môi trường có thể được sử dụng để cấu hình:
- `DB_HOST`: Host của database (mặc định: `postgres`)
- `DB_PORT`: Port của database (mặc định: `5432`)
- `DB_NAME`: Tên database (mặc định: `quizz`)
- `DB_USER`: Username (mặc định: `postgres`)
- `DB_PASSWORD`: Password (mặc định: `password`)

---

## 📋 Danh sách các Tables trong Database

Database `quizz` được sử dụng chung bởi tất cả các microservices trong hệ thống.

### 1. User Auth Service Tables

#### 1.1. `users` - Bảng người dùng
Lưu trữ thông tin tài khoản người dùng trong hệ thống.

**Các cột:**
- `id` (BIGSERIAL, PRIMARY KEY): ID duy nhất của user
- `email` (VARCHAR(255), UNIQUE, NOT NULL): Email đăng nhập
- `password_hash` (VARCHAR(255), NOT NULL): Mật khẩu đã được hash (BCrypt)
- `full_name` (VARCHAR(255), NOT NULL): Họ và tên đầy đủ
- `phone_number` (VARCHAR(20)): Số điện thoại
- `date_of_birth` (DATE): Ngày sinh
- `gender` (VARCHAR(20)): Giới tính (MALE, FEMALE, OTHER)
- `is_email_verified` (BOOLEAN, DEFAULT TRUE): Trạng thái xác thực email
- `role` (VARCHAR(20), DEFAULT 'USER'): Vai trò (USER, ADMIN)
- `created_at` (TIMESTAMP, DEFAULT NOW()): Thời gian tạo
- `updated_at` (TIMESTAMP, DEFAULT NOW()): Thời gian cập nhật

**Indexes:**
- `idx_users_email`: Index trên cột `email`
- `idx_users_role`: Index trên cột `role`

---

#### 1.2. `invalid_tokens` - Tokens đã bị vô hiệu hóa
Lưu trữ các JWT tokens đã bị logout hoặc revoke.

**Các cột:**
- `id` (BIGSERIAL, PRIMARY KEY): ID duy nhất
- `token` (VARCHAR(512), UNIQUE, NOT NULL): Token đã bị vô hiệu hóa
- `expiration_time` (TIMESTAMP, NOT NULL): Thời gian hết hạn của token
- `created_at` (TIMESTAMP, DEFAULT NOW()): Thời gian tạo
- `updated_at` (TIMESTAMP, DEFAULT NOW()): Thời gian cập nhật

**Indexes:**
- `idx_invalid_tokens_token`: Index trên cột `token`
- `idx_invalid_tokens_expiration`: Index trên cột `expiration_time`

---

#### 1.3. `password_reset_tokens` - Tokens reset mật khẩu
Lưu trữ các tokens dùng để reset mật khẩu.

**Các cột:**
- `id` (BIGSERIAL, PRIMARY KEY): ID duy nhất
- `token` (VARCHAR(255), UNIQUE, NOT NULL): Token reset password
- `user_id` (BIGINT, NOT NULL, FOREIGN KEY -> users.id): ID của user
- `expires_at` (TIMESTAMP, NOT NULL): Thời gian hết hạn
- `used` (BOOLEAN, DEFAULT FALSE): Đã sử dụng hay chưa
- `created_at` (TIMESTAMP, DEFAULT NOW()): Thời gian tạo
- `updated_at` (TIMESTAMP, DEFAULT NOW()): Thời gian cập nhật

**Indexes:**
- `idx_password_reset_tokens_token`: Index trên cột `token`
- `idx_password_reset_tokens_user_id`: Index trên cột `user_id`
- `idx_password_reset_tokens_expires_at`: Index trên cột `expires_at`

---

### 2. Quiz Service Tables

#### 2.1. `quizzes` - Bảng bài quiz
Lưu trữ thông tin các bài quiz.

**Các cột:**
- `id` (BIGSERIAL, PRIMARY KEY): ID duy nhất của quiz
- `title` (VARCHAR(255), NOT NULL): Tiêu đề quiz
- `description` (TEXT): Mô tả quiz
- `total_score` (INT, DEFAULT 0): Tổng điểm của quiz
- `duration_minutes` (INT): Thời gian làm bài (phút)
- `max_attempts` (INT, DEFAULT 1): Số lần làm bài tối đa
- `visibility` (quiz_visibility_enum, DEFAULT 'PUBLIC'): Trạng thái hiển thị (PUBLIC, PRIVATE)
- `topic` (VARCHAR(100)): Chủ đề quiz
- `difficulty` (difficulty_enum): Độ khó (EASY, MEDIUM, HARD)
- `tags` (TEXT[]): Mảng các tags
- `creator_id` (BIGINT, NOT NULL): ID người tạo (không có FK, validate qua API)
- `created_at` (TIMESTAMP, DEFAULT NOW()): Thời gian tạo
- `updated_at` (TIMESTAMP, DEFAULT NOW()): Thời gian cập nhật

**Indexes:**
- `idx_quizzes_creator_id`: Index trên cột `creator_id`
- `idx_quizzes_visibility`: Index trên cột `visibility`
- `idx_quizzes_topic`: Index trên cột `topic`
- `idx_quizzes_difficulty`: Index trên cột `difficulty`

---

#### 2.2. `questions` - Bảng câu hỏi
Lưu trữ các câu hỏi trong quiz.

**Các cột:**
- `id` (BIGSERIAL, PRIMARY KEY): ID duy nhất của câu hỏi
- `quiz_id` (BIGINT, NOT NULL, FOREIGN KEY -> quizzes.id): ID của quiz
- `type` (question_type_enum, NOT NULL): Loại câu hỏi (MULTIPLE_CHOICE, TRUE_FALSE, ESSAY)
- `content` (TEXT, NOT NULL): Nội dung câu hỏi
- `options` (JSONB): Các lựa chọn (dạng JSON)
- `correct_answer` (JSONB): Đáp án đúng (dạng JSON)
- `score` (INT, DEFAULT 1): Điểm số của câu hỏi
- `difficulty` (difficulty_enum): Độ khó (EASY, MEDIUM, HARD)
- `tags` (TEXT[]): Mảng các tags
- `created_at` (TIMESTAMP, DEFAULT NOW()): Thời gian tạo
- `updated_at` (TIMESTAMP, DEFAULT NOW()): Thời gian cập nhật

**Indexes:**
- `idx_questions_quiz_id`: Index trên cột `quiz_id`
- `idx_questions_type`: Index trên cột `type`

---

#### 2.3. `attempts` - Bảng lần làm bài
Lưu trữ các lần làm bài quiz của học sinh.

**Các cột:**
- `id` (BIGSERIAL, PRIMARY KEY): ID duy nhất của attempt
- `user_id` (BIGINT, NOT NULL): ID của user (không có FK, validate qua API)
- `quiz_id` (BIGINT, NOT NULL, FOREIGN KEY -> quizzes.id): ID của quiz
- `start_time` (TIMESTAMP, DEFAULT NOW()): Thời gian bắt đầu
- `end_time` (TIMESTAMP): Thời gian kết thúc
- `score` (INT, DEFAULT 0): Điểm số đạt được
- `is_submitted` (BOOLEAN, DEFAULT FALSE): Đã nộp bài hay chưa
- `shuffle_seed` (INT): Seed để shuffle câu hỏi
- `created_at` (TIMESTAMP, DEFAULT NOW()): Thời gian tạo

**Indexes:**
- `idx_attempts_user_id`: Index trên cột `user_id`
- `idx_attempts_quiz_id`: Index trên cột `quiz_id`
- `idx_attempts_submitted`: Index trên cột `is_submitted`

---

#### 2.4. `attempt_answers` - Bảng câu trả lời của attempt
Lưu trữ các câu trả lời trong mỗi lần làm bài.

**Các cột:**
- `id` (BIGSERIAL, PRIMARY KEY): ID duy nhất
- `attempt_id` (BIGINT, NOT NULL, FOREIGN KEY -> attempts.id): ID của attempt
- `question_id` (BIGINT, NOT NULL, FOREIGN KEY -> questions.id): ID của câu hỏi
- `answer` (JSONB): Câu trả lời của học sinh (dạng JSON)
- `is_correct` (BOOLEAN): Câu trả lời đúng hay sai
- `updated_at` (TIMESTAMP, DEFAULT NOW()): Thời gian cập nhật

**Indexes:**
- `idx_attempt_answers_attempt_id`: Index trên cột `attempt_id`
- `idx_attempt_answers_question_id`: Index trên cột `question_id`

---

### 3. Notification Service Tables

#### 3.1. `notifications` - Bảng thông báo
Lưu trữ các thông báo gửi đến người dùng.

**Các cột:**
- `id` (SERIAL, PRIMARY KEY): ID duy nhất
- `user_id` (INT, NOT NULL): ID của user (không có FK, validate qua API)
- `type` (VARCHAR(100), NOT NULL): Loại thông báo
- `title` (VARCHAR(255), NOT NULL): Tiêu đề thông báo
- `content` (TEXT, NOT NULL): Nội dung thông báo
- `channel` (VARCHAR(20), NOT NULL): Kênh gửi (email, push, sms)
- `is_read` (BOOLEAN, DEFAULT FALSE): Đã đọc hay chưa
- `status` (VARCHAR(20), DEFAULT 'pending'): Trạng thái (pending, sent, failed)
- `created_at` (TIMESTAMP, DEFAULT NOW()): Thời gian tạo
- `updated_at` (TIMESTAMP, DEFAULT NOW()): Thời gian cập nhật
- `metadata` (JSONB): Dữ liệu bổ sung (dạng JSON)

**Indexes:**
- `idx_notifications_user_id`: Index trên cột `user_id`
- `idx_notifications_type`: Index trên cột `type`
- `idx_notifications_status`: Index trên cột `status`
- `idx_notifications_created_at`: Index trên cột `created_at`
- `idx_notifications_is_read`: Index trên cột `is_read`

---

#### 3.2. `preferences` - Bảng tùy chọn thông báo
Lưu trữ các tùy chọn nhận thông báo của người dùng.

**Các cột:**
- `id` (SERIAL, PRIMARY KEY): ID duy nhất
- `user_id` (INT, NOT NULL): ID của user (không có FK, validate qua API)
- `channel` (VARCHAR(20), NOT NULL): Kênh thông báo (email, push, sms)
- `enabled` (BOOLEAN, DEFAULT TRUE): Bật/tắt thông báo
- `frequency` (VARCHAR(20), DEFAULT 'immediate'): Tần suất (immediate, daily, weekly)
- `updated_at` (TIMESTAMP, DEFAULT NOW()): Thời gian cập nhật
- **Constraint:** UNIQUE (user_id, channel)

**Indexes:**
- `idx_preferences_user_id`: Index trên cột `user_id`

---

#### 3.3. `templates` - Bảng template thông báo
Lưu trữ các template email/thông báo.

**Các cột:**
- `id` (SERIAL, PRIMARY KEY): ID duy nhất
- `name` (VARCHAR(100), UNIQUE, NOT NULL): Tên template
- `subject` (VARCHAR(255), NOT NULL): Tiêu đề email
- `body_html` (TEXT, NOT NULL): Nội dung HTML
- `body_text` (TEXT): Nội dung text thuần
- `channel` (VARCHAR(20), NOT NULL): Kênh (email, push, sms)
- `created_at` (TIMESTAMP, DEFAULT NOW()): Thời gian tạo
- `updated_at` (TIMESTAMP, DEFAULT NOW()): Thời gian cập nhật

**Indexes:**
- `idx_templates_name`: Index trên cột `name`
- `idx_templates_channel`: Index trên cột `channel`

---

#### 3.4. `email_templates` - Bảng template email (backward compatibility)
Tương tự `templates`, dùng để tương thích ngược.

**Các cột:** Giống như bảng `templates`

---

### 4. Class Assignment Service Tables

#### 4.1. `classes` - Bảng lớp học
Lưu trữ thông tin các lớp học.

**Các cột:**
- `id` (BIGSERIAL, PRIMARY KEY): ID duy nhất của lớp
- `name` (VARCHAR(255), NOT NULL): Tên lớp
- `description` (TEXT): Mô tả lớp
- `topic` (VARCHAR(100)): Chủ đề lớp
- `status` (VARCHAR(20), DEFAULT 'ACTIVE'): Trạng thái (ACTIVE, INACTIVE, ARCHIVED)
- `teacher_id` (BIGINT, NOT NULL): ID giáo viên (không có FK, validate qua API)
- `invitation_code` (VARCHAR(20), UNIQUE): Mã mời tham gia lớp
- `created_at` (TIMESTAMP, DEFAULT NOW()): Thời gian tạo
- `updated_at` (TIMESTAMP, DEFAULT NOW()): Thời gian cập nhật

**Indexes:**
- `idx_classes_teacher_id`: Index trên cột `teacher_id`
- `idx_classes_status`: Index trên cột `status`
- `idx_classes_invitation_code`: Index trên cột `invitation_code`

---

#### 4.2. `class_members` - Bảng thành viên lớp
Lưu trữ danh sách thành viên trong lớp.

**Các cột:**
- `id` (BIGSERIAL, PRIMARY KEY): ID duy nhất
- `class_id` (BIGINT, NOT NULL, FOREIGN KEY -> classes.id): ID của lớp
- `user_id` (BIGINT, NOT NULL): ID của user (không có FK, validate qua API)
- `role` (class_role_enum, DEFAULT 'STUDENT'): Vai trò (TEACHER, STUDENT, TA)
- `joined_at` (TIMESTAMP, DEFAULT NOW()): Thời gian tham gia
- **Constraint:** UNIQUE (class_id, user_id)

**Indexes:**
- `idx_class_members_class_id`: Index trên cột `class_id`
- `idx_class_members_user_id`: Index trên cột `user_id`
- `idx_class_members_role`: Index trên cột `role`

---

#### 4.3. `assignments` - Bảng bài tập
Lưu trữ các bài tập được giao trong lớp.

**Các cột:**
- `id` (BIGSERIAL, PRIMARY KEY): ID duy nhất của assignment
- `class_id` (BIGINT, NOT NULL, FOREIGN KEY -> classes.id): ID của lớp
- `quiz_id` (BIGINT, NOT NULL): ID của quiz (không có FK, validate qua API)
- `title` (VARCHAR(255), NOT NULL): Tiêu đề bài tập
- `description` (TEXT): Mô tả bài tập
- `start_time` (TIMESTAMP, NOT NULL): Thời gian bắt đầu
- `due_time` (TIMESTAMP, NOT NULL): Thời gian hết hạn
- `allow_multiple_attempts` (BOOLEAN, DEFAULT FALSE): Cho phép làm nhiều lần
- `max_score` (INT): Điểm tối đa
- `created_at` (TIMESTAMP, DEFAULT NOW()): Thời gian tạo
- `updated_at` (TIMESTAMP, DEFAULT NOW()): Thời gian cập nhật

**Indexes:**
- `idx_assignments_class_id`: Index trên cột `class_id`
- `idx_assignments_quiz_id`: Index trên cột `quiz_id`
- `idx_assignments_due_time`: Index trên cột `due_time`

---

#### 4.4. `student_progress` - Bảng tiến độ học sinh
Lưu trữ tiến độ làm bài của học sinh.

**Các cột:**
- `id` (BIGSERIAL, PRIMARY KEY): ID duy nhất
- `assignment_id` (BIGINT, NOT NULL, FOREIGN KEY -> assignments.id): ID của assignment
- `student_id` (BIGINT, NOT NULL): ID của học sinh (không có FK, validate qua API)
- `status` (VARCHAR(20), DEFAULT 'NOT_STARTED'): Trạng thái (NOT_STARTED, IN_PROGRESS, COMPLETED)
- `score` (INT, DEFAULT 0): Điểm số đạt được
- `last_updated` (TIMESTAMP, DEFAULT NOW()): Thời gian cập nhật lần cuối
- `attempt_id` (BIGINT): ID của attempt (liên kết với quiz service)
- **Constraint:** UNIQUE (assignment_id, student_id)

**Indexes:**
- `idx_student_progress_assignment_id`: Index trên cột `assignment_id`
- `idx_student_progress_student_id`: Index trên cột `student_id`
- `idx_student_progress_status`: Index trên cột `status`

---

## 🔧 ENUM Types

Database sử dụng các ENUM types sau:

### User Auth Service
- `gender_enum`: MALE, FEMALE, OTHER
- `role_enum`: USER, ADMIN

### Quiz Service
- `quiz_visibility_enum`: PUBLIC, PRIVATE
- `question_type_enum`: MULTIPLE_CHOICE, TRUE_FALSE, ESSAY
- `difficulty_enum`: EASY, MEDIUM, HARD

### Class Assignment Service
- `class_role_enum`: TEACHER, STUDENT, TA

---

## 📊 Tổng kết

### Số lượng Tables
- **User Auth Service:** 3 tables
- **Quiz Service:** 4 tables
- **Notification Service:** 4 tables
- **Class Assignment Service:** 4 tables
- **Tổng cộng:** 15 tables

### Relationships
- `password_reset_tokens` → `users` (FOREIGN KEY)
- `questions` → `quizzes` (FOREIGN KEY)
- `attempts` → `quizzes` (FOREIGN KEY)
- `attempt_answers` → `attempts` (FOREIGN KEY)
- `attempt_answers` → `questions` (FOREIGN KEY)
- `class_members` → `classes` (FOREIGN KEY)
- `assignments` → `classes` (FOREIGN KEY)
- `student_progress` → `assignments` (FOREIGN KEY)

---

## 🚀 Cách sử dụng

### Kết nối từ command line
```bash
psql -h postgres -p 5432 -U postgres -d quizz
```

### Kết nối từ ứng dụng
Xem file `application.yml` hoặc các file config của từng service để biết cách cấu hình kết nối.

### Import dữ liệu mẫu
Sử dụng file `import_data.sql` để import dữ liệu mẫu vào database.

```bash
# Từ Docker container
docker exec -i postgres psql -U postgres -d quizz < import_data.sql

# Hoặc từ local
psql -h postgres -p 5432 -U postgres -d quizz -f import_data.sql
```

---

## 📝 Lưu ý

1. **Không có Foreign Key trực tiếp:** Một số bảng không có FOREIGN KEY constraint trực tiếp (như `creator_id`, `user_id` trong một số bảng) vì các services validate qua API calls.

2. **Auto Migration:** Các services sử dụng Hibernate/JPA với `ddl-auto: update` nên schema có thể tự động cập nhật khi chạy ứng dụng.

3. **Backup:** Nên backup database thường xuyên, đặc biệt là trong môi trường production.

4. **Indexes:** Các indexes đã được tạo để tối ưu hiệu suất truy vấn.

