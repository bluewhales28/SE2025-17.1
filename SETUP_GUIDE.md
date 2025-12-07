# Quiz App - Hướng Dẫn Setup và Chạy Ứng Dụng

## 📋 Mục Lục
- [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
- [Cài Đặt Lần Đầu](#cài-đặt-lần-đầu)
- [Chạy Ứng Dụng](#chạy-ứng-dụng)
- [Cấu Hình Email (SMTP)](#cấu-hình-email-smtp)
- [Truy Cập Ứng Dụng](#truy-cập-ứng-dụng)
- [Các Lệnh Thường Dùng](#các-lệnh-thường-dùng)
- [Xử Lý Lỗi Thường Gặp](#xử-lý-lỗi-thường-gặp)

---

## 🔧 Yêu Cầu Hệ Thống

### Phần Mềm Cần Thiết
- **Docker Desktop** (phiên bản mới nhất)
  - Windows: [Download Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
  - Mac: [Download Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
  - Linux: Docker Engine + Docker Compose

- **Git** (để clone repository)

### Yêu Cầu Phần Cứng
- RAM: Tối thiểu 8GB (khuyến nghị 16GB)
- Dung lượng: ~10GB cho Docker images và volumes
- CPU: 4 cores trở lên

---

## 🚀 Cài Đặt Lần Đầu

### Bước 1: Clone Repository
```bash
git clone https://github.com/bluewhales28/SE2025-17.1.git
cd SE2025-17.1
```

### Bước 2: Tạo File Cấu Hình (.env)
Tạo file `.env` trong thư mục gốc:

```env
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
DB_NAME=quizz

# JWT Secret (dùng secret đã có hoặc tạo mới)
JWT_SECRET=5020f057d0d31c44d2397a3265c89b86b95a1903160610e290786cfe36e43e7b

# Frontend URL (dùng localhost qua nginx)
FRONTEND_URL=http://localhost

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Quiz App
```

**⚠️ Lưu ý về Email:**
- Với Gmail, cần tạo [App Password](https://myaccount.google.com/apppasswords)
- Không dùng mật khẩu Gmail thông thường
- Xem hướng dẫn chi tiết ở phần [Cấu Hình Email](#cấu-hình-email-smtp)

### Bước 3: Build và Khởi Động Ứng Dụng
```bash
# Build tất cả services
docker-compose up -d --build

# Đợi ~2-3 phút để các services khởi động hoàn tất
```

### Bước 4: Kiểm Tra Trạng Thái
```bash
# Xem tất cả containers đang chạy
docker ps

# Kiểm tra logs nếu có vấn đề
docker-compose logs -f
```

Bạn sẽ thấy 8 containers:
- ✅ **nginx** (port 80)
- ✅ **frontend** (Next.js)
- ✅ **user-auth-service** (Spring Boot)
- ✅ **quiz-service** (Go)
- ✅ **notification-service** (Go)
- ✅ **postgres** (port 5432)
- ✅ **redis** (port 6379)
- ✅ **rabbitmq** (ports 5672, 15672)

---

## 🎯 Chạy Ứng Dụng

### Khởi Động Ứng Dụng
```bash
# Khởi động tất cả services
docker-compose up -d

# Xem logs real-time
docker-compose logs -f

# Xem logs của một service cụ thể
docker-compose logs -f user-auth-service
```

### Dừng Ứng Dụng
```bash
# Dừng tất cả services
docker-compose down

# Dừng và xóa volumes (MẤT DỮ LIỆU)
docker-compose down -v
```

### Rebuild Sau Khi Thay Đổi Code
```bash
# Rebuild tất cả
docker-compose up -d --build

# Rebuild một service cụ thể
docker-compose up -d --build user-auth-service
```

---

## 📧 Cấu Hình Email (SMTP)

### Dùng Gmail

1. **Bật 2-Step Verification:**
   - Truy cập: https://myaccount.google.com/security
   - Bật "2-Step Verification"

2. **Tạo App Password:**
   - Truy cập: https://myaccount.google.com/apppasswords
   - Chọn app: "Mail"
   - Chọn device: "Other" → Nhập "Quiz App"
   - Copy 16-ký tự password được tạo

3. **Cập nhật file `.env`:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop  # App password (16 ký tự)
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Quiz App
```

4. **Restart notification-service:**
```bash
docker-compose restart notification-service
```

### Test Gửi Email

1. Vào trang: http://localhost/auth/forgot-password
2. Nhập email đã đăng ký
3. Kiểm tra hộp thư

**Kiểm tra logs nếu không nhận được email:**
```bash
docker-compose logs notification-service | grep -i error
```

---

## 🌐 Truy Cập Ứng Dụng

### URLs Chính

| Service | URL | Mô tả |
|---------|-----|-------|
| **Frontend** | http://localhost | Trang web chính (qua Nginx) |
| **API Gateway** | http://localhost/api/v1/ | Backend APIs (qua Nginx) |
| **RabbitMQ Management** | http://localhost:15672 | Username: `guest` / Password: `guest` |

### Test Endpoints

**Health Check:**
```bash
# User Auth Service
curl http://localhost/api/v1/auth/health

# Test Login
curl -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 💻 Các Lệnh Thường Dùng

### Docker Commands

```bash
# Xem logs
docker-compose logs -f [service-name]

# Restart một service
docker-compose restart [service-name]

# Xem containers đang chạy
docker ps

# Truy cập vào container
docker exec -it [container-name] sh
docker exec -it user-auth-service sh

# Xem resource usage
docker stats

# Clean up (xóa images không dùng)
docker system prune -a
```

### Database Commands

```bash
# Truy cập PostgreSQL
docker exec -it postgres psql -U postgres -d quizz

# Xem danh sách users
docker exec postgres psql -U postgres -d quizz -c "SELECT email, full_name, role FROM users;"

# Xem email templates
docker exec postgres psql -U postgres -d quizz -c "SELECT id, name, subject FROM email_templates;"

# Backup database
docker exec postgres pg_dump -U postgres quizz > backup.sql

# Restore database
docker exec -i postgres psql -U postgres quizz < backup.sql
```

### Git Commands

```bash
# Pull latest code
git pull origin main

# Sau khi pull code mới
docker-compose down
docker-compose up -d --build
```

---

## 🔍 Xử Lý Lỗi Thường Gặp

### 1. Port Already in Use

**Lỗi:** `Bind for 0.0.0.0:80 failed: port is already allocated`

**Giải pháp:**
```bash
# Tìm process đang dùng port
netstat -ano | findstr :80   # Windows
lsof -i :80                   # Mac/Linux

# Hoặc thay đổi port trong docker-compose.yml
# nginx:
#   ports:
#     - "8080:80"  # Thay vì 80:80
```

### 2. Container Không Khởi Động

**Kiểm tra logs:**
```bash
docker-compose logs [service-name]
```

**Rebuild lại:**
```bash
docker-compose down
docker-compose up -d --build [service-name]
```

### 3. 502 Bad Gateway (Nginx)

**Nguyên nhân:** Backend service chưa sẵn sàng hoặc sai port

**Giải pháp:**
```bash
# Kiểm tra backend service
docker-compose logs user-auth-service

# Đợi service khởi động hoàn tất
docker-compose restart nginx
```

### 4. 404 Not Found (API)

**Nguyên nhân:** Nginx routing hoặc backend endpoint sai

**Kiểm tra:**
```bash
# Test trực tiếp backend (bỏ qua nginx)
docker exec nginx wget -qO- http://user-auth-service:8082/actuator/health

# Xem nginx config
docker exec nginx cat /etc/nginx/nginx.conf
```

### 5. Email Không Gửi Được

**Kiểm tra:**
```bash
# Xem logs notification service
docker-compose logs notification-service | grep -i email

# Kiểm tra RabbitMQ queue
docker exec rabbitmq rabbitmqctl list_queues
```

**Common issues:**
- ❌ Sai SMTP credentials → Kiểm tra lại App Password
- ❌ Template không tồn tại → Chạy lại SQL insert templates
- ❌ RabbitMQ không kết nối → Restart notification-service

### 6. Database Connection Failed

**Kiểm tra:**
```bash
# Xem postgres logs
docker-compose logs postgres

# Test connection
docker exec postgres pg_isready -U postgres
```

**Giải pháp:**
```bash
# Restart postgres
docker-compose restart postgres

# Hoặc recreate với volume mới
docker-compose down -v
docker-compose up -d
```

### 7. Out of Memory

**Giải pháp:**
```bash
# Tăng memory cho Docker Desktop
# Settings → Resources → Memory → Tăng lên 8GB+

# Hoặc tắt services không cần thiết
docker-compose stop quiz-service
docker-compose stop notification-service
```

---

## 📊 Monitoring & Debugging

### Check Service Health

```bash
# All services
docker-compose ps

# Specific health checks
curl http://localhost/api/v1/auth/actuator/health
```

### View Logs by Time Range

```bash
# Last 100 lines
docker-compose logs --tail=100

# Since timestamp
docker-compose logs --since 2024-12-07T10:00:00

# Follow new logs
docker-compose logs -f --tail=50
```

### Performance Monitoring

```bash
# Resource usage
docker stats

# Container processes
docker top user-auth-service
```

---

## 📝 Tài Khoản Test

Sau khi setup xong, bạn có thể dùng các tài khoản sau để test:

| Email | Password | Role |
|-------|----------|------|
| `testuser@example.com` | *(cần biết)* | USER |
| `luntanson@gmail.com` | *(cần biết)* | USER |

**Hoặc đăng ký tài khoản mới tại:** http://localhost/auth/register

---

## 🛠️ Development Workflow

### 1. Thay Đổi Code Backend (Java/Spring Boot)

```bash
# Rebuild service cụ thể
docker-compose up -d --build user-auth-service

# Xem logs
docker-compose logs -f user-auth-service
```

### 2. Thay Đổi Code Frontend (Next.js)

```bash
# Rebuild frontend
docker-compose up -d --build frontend

# Frontend sẽ tự động reload (hot reload)
```

### 3. Thay Đổi Nginx Config

```bash
# Sửa file nginx/nginx.conf

# Rebuild nginx
docker-compose up -d --build --force-recreate nginx
```

### 4. Database Schema Changes

```bash
# Thêm migration vào postgres-init/02-templates.sql

# Hoặc chạy trực tiếp
docker exec -i postgres psql -U postgres quizz < migration.sql
```

---

## 📚 Tài Liệu Liên Quan

- [Docker Documentation](https://docs.docker.com/)
- [Spring Boot Reference](https://spring.io/projects/spring-boot)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)

---

## 🤝 Support

Nếu gặp vấn đề:
1. Kiểm tra [Xử Lý Lỗi Thường Gặp](#xử-lý-lỗi-thường-gặp)
2. Xem logs chi tiết: `docker-compose logs -f`
3. Liên hệ team qua GitHub Issues

---

## 📄 License

This project is licensed under the MIT License.
