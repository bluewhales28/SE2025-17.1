# 📊 Database Structure - Database `quizz`

Tất cả services đều kết nối với **database `quizz` duy nhất**.

## 🔗 Kết nối Database

### 1. User Auth Service (Spring Boot)
- **Config:** `backend/user-auth-service/src/main/resources/application.yml`
- **Database:** `${DB_NAME:quizz}` (default: `quizz`)
- **Connection:** `jdbc:postgresql://postgres:5432/quizz`

### 2. Quiz Service (Go)
- **Config:** `backend/quiz-service/db/db.go`
- **Database:** `DB_NAME` environment variable (default: `quizz`)
- **Connection:** DSN từ biến môi trường

### 3. Notification Service (Go)
- **Config:** `backend/notification-service/config/config.go`
- **Database:** `DB_NAME` environment variable (default: `quizz`)
- **Connection:** DSN từ biến môi trường

### 4. Class Assignment Service (Spring Boot)
- **Config:** `backend/class-assignment-service/src/main/resources/application.yml`
- **Database:** `${DB_NAME:quizz}` (default: `quizz`)
- **Connection:** `jdbc:postgresql://postgres:5432/quizz`

## 📋 Tables trong Database `quizz`

### User Auth Service Tables
1. **users** - Thông tin người dùng
   - `id`, `email`, `password_hash`, `full_name`, `phone_number`, `date_of_birth`, `gender`, `is_email_verified`, `role`, `created_at`, `updated_at`

2. **invalid_tokens** - Tokens đã logout
   - `id`, `token`, `expiration_time`, `created_at`, `updated_at`

3. **password_reset_tokens** - Tokens reset password
   - `id`, `token`, `user_id`, `expires_at`, `used`, `created_at`, `updated_at`

### Quiz Service Tables
4. **quizzes** - Bài quiz
   - `id`, `title`, `description`, `time_limit`, `total_points`, `max_attempts`, `is_public`, `tags`, `topic`, `difficulty`, `creator_id`, `created_at`, `updated_at`

5. **questions** - Câu hỏi
   - `id`, `content`, `type`, `difficulty`, `points`, `tags`, `quiz_id`, `created_at`, `updated_at`

6. **answers** - Câu trả lời
   - `id`, `content`, `is_correct`, `question_id`

7. **quiz_attempts** - Lần làm bài
   - `id`, `user_id`, `quiz_id`, `start_time`, `end_time`, `score`, `status`

### Notification Service Tables
8. **notifications** - Thông báo
   - `id`, `user_id`, `type`, `title`, `content`, `channel`, `is_read`, `status`, `created_at`, `updated_at`, `metadata`

9. **preferences** - Tùy chọn thông báo
   - `id`, `user_id`, `channel`, `enabled`, `frequency`, `updated_at`

10. **email_templates** - Templates email
    - `id`, `name`, `subject`, `body_html`, `body_text`, `channel`, `created_at`, `updated_at`

### Class Assignment Service Tables
11. **classes** - Lớp học
    - `id`, `name`, `description`, `topic`, `status`, `teacher_id`, `invitation_code`, `created_at`, `updated_at`

12. **class_members** - Thành viên lớp
    - `id`, `class_id`, `user_id`, `role`, `joined_at`

13. **assignments** - Bài tập
    - `id`, `class_id`, `quiz_id`, `title`, `description`, `start_time`, `due_time`, `allow_multiple_attempts`, `max_score`, `created_at`, `updated_at`

14. **student_progress** - Tiến độ học sinh
    - `id`, `assignment_id`, `student_id`, `status`, `score`, `last_updated`

## 🔧 Environment Variables (docker-compose.prod.yml)

Tất cả services đều dùng các biến môi trường sau:
```yaml
DB_HOST=postgres
DB_PORT=5432
DB_NAME=quizz          # ← Tất cả services dùng database này
DB_USER=postgres
DB_PASSWORD=password
```

## 📝 Import Database Schema

Để tạo tất cả tables, chạy file `database_merged.sql`:

```bash
docker exec -i postgres psql -U postgres -d quizz < database_merged.sql
```

File này đã bao gồm:
- Tất cả ENUM types
- Tất cả tables từ 4 services
- Tất cả indexes
- Sample data (nếu tables còn trống)

## ✅ Verification

Kiểm tra tất cả tables đã tồn tại:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Kết quả mong đợi: 14 tables như liệt kê ở trên.

