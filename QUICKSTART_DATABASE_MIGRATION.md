# Quick Start Guide - Database Per Service Migration

## 🚀 Cách sử dụng

### 1. Chuẩn bị

```bash
# Copy environment variables
cp .env.microservices.example .env

# Chỉnh sửa .env với credentials thực tế
nano .env  # hoặc vim, code, notepad++
```

### 2. Chạy Migration

```bash
# Trên Linux/Mac
chmod +x migrate-to-microservices.sh
./migrate-to-microservices.sh

# Trên Windows (Git Bash)
bash migrate-to-microservices.sh
```

### 3. Test

```bash
# Test database connections
chmod +x test-database-per-service.sh
./test-database-per-service.sh
```

### 4. Nếu cần Rollback

```bash
chmod +x rollback-migration.sh
./rollback-migration.sh
```

## 📊 Kiểm tra trạng thái

```bash
# Xem tất cả containers
docker-compose -f docker-compose.microservices.yml ps

# Xem logs của service cụ thể
docker-compose -f docker-compose.microservices.yml logs -f user-auth-service
docker-compose -f docker-compose.microservices.yml logs -f quiz-service

# Kết nối vào database để kiểm tra
docker exec -it user-auth-db psql -U auth_user -d user_auth_db
docker exec -it quiz-db psql -U quiz_user -d quiz_db
```

## 🔍 Test thủ công

### Test User Auth Service

```bash
# Register user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Quiz Service

```bash
# Get all quizzes
curl http://localhost:8083/api/quizzes

# Get quiz by ID
curl http://localhost:8083/api/quizzes/1
```

### Test Database Isolation

```bash
# Thử truy cập bảng users từ quiz-db (phải fail)
docker exec quiz-db psql -U quiz_user -d quiz_db -c "SELECT * FROM users"
# Expected: ERROR: relation "users" does not exist

# Thử truy cập bảng quizzes từ user-auth-db (phải fail)
docker exec user-auth-db psql -U auth_user -d user_auth_db -c "SELECT * FROM quizzes"
# Expected: ERROR: relation "quizzes" does not exist
```

## 🛑 Dừng services

```bash
# Dừng tất cả
docker-compose -f docker-compose.microservices.yml down

# Dừng và xóa volumes (cẩn thận - mất data!)
docker-compose -f docker-compose.microservices.yml down -v
```

## 📝 Notes

- **Port mapping:**
  - User Auth DB: 5432
  - Quiz DB: 5433
  - Class DB: 5434
  - Notification DB: 5435
  - Recommendation DB: 5436
  - Analytics DB: 5437

- **Service ports:**
  - User Auth Service: 8080
  - Class Assignment Service: 8081
  - Notification Service: 8082
  - Quiz Service: 8083
  - Analytics Service: 8084
  - Recommendation Service: 8085

## 🔒 Security Notes

**QUAN TRỌNG:** Đổi tất cả passwords trong `.env` trước khi deploy production!

```env
# ❌ KHÔNG dùng passwords mặc định trong production
AUTH_DB_PASSWORD=auth_pass_secure_123  # ← Đổi thành password mạnh

# ✅ Dùng passwords phức tạp
AUTH_DB_PASSWORD=aB3$xY9#mK2@pL7!qR5
```

## 📚 Tài liệu đầy đủ

Xem [DATABASE_PER_SERVICE_MIGRATION.md](./DATABASE_PER_SERVICE_MIGRATION.md) để hiểu chi tiết về kiến trúc và implementation.
