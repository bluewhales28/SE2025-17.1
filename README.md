# 🎓 Quiz Application - SE2025-17.1

Hệ thống thi trắc nghiệm trực tuyến với kiến trúc microservices

## 📋 Tổng quan

Ứng dụng quiz online cho phép giảng viên tạo bài thi, học sinh làm bài và nhận thông báo qua email. Được xây dựng theo kiến trúc microservices với database riêng biệt cho từng service.

## 🏗️ Kiến trúc

### Microservices
- **Frontend** (Next.js + TypeScript) - Port 3000
- **User Auth Service** (Spring Boot + Java) - Port 8080
- **Quiz Service** (Go) - Port 8083  
- **Notification Service** (Go) - Port 8082

### Infrastructure
- **Nginx** - API Gateway & Reverse Proxy (Port 80)
- **PostgreSQL** - Database per Service pattern
- **Redis** - Caching layer
- **RabbitMQ** - Message queue cho notifications

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Development (Local)

```bash
# Clone repository
git clone <repository-url>
cd SE2025-17.1

# Tạo file .env
cp .env.example .env
# Điền SMTP_PASSWORD (Gmail App Password)

# Chạy tất cả services với microservices architecture
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down
```

**Truy cập:**
- Frontend: http://localhost
- RabbitMQ Management: http://localhost:15672 (guest/guest)

### Production (Server Deploy)

```bash
# Trên server production
git clone <repository-url>
cd SE2025-17.1

# Tạo .env cho production
cp .env.example .env
nano .env  # Cập nhật FRONTEND_URL=http://<your-server-ip>

# Deploy chỉ 4 services chính
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

## 📦 Services Chi tiết

### 1. Frontend (Next.js)
**Location:** `frontend/`

**Tech Stack:**
- Next.js 15 (App Router)
- TypeScript
- TailwindCSS + shadcn/ui
- Zustand (State management)

**Features:**
- Authentication (Login/Register/Forgot Password)
- Quiz management UI
- Real-time notifications
- Responsive design

**API Integration:**
```typescript
// Base URL
NEXT_PUBLIC_API_URL=http://localhost/api/v1

// Endpoints
/api/v1/auth/*     → User Auth Service
/api/v1/users/*    → User Auth Service
/api/v1/quizzes/*  → Quiz Service
/api/v1/notifications/* → Notification Service
```

### 2. User Auth Service (Spring Boot)
**Location:** `backend/user-auth-service/`

**Tech Stack:**
- Java 17 + Spring Boot 3.x
- Spring Security + JWT
- PostgreSQL (Database: `user_auth_db`)

**Features:**
- User registration & login
- JWT token authentication
- Password reset via email
- Role-based access control (STUDENT/TEACHER)

**API Endpoints:**
```
POST   /auth/register          - Đăng ký user mới
POST   /auth/login             - Đăng nhập
POST   /auth/refresh           - Refresh JWT token
POST   /auth/forgot-password   - Yêu cầu reset password
POST   /auth/reset-password    - Reset password với token
GET    /users/profile          - Lấy thông tin user
PUT    /users/profile          - Cập nhật profile
```

**Database:** Port 5432 (`user-auth-db`)

### 3. Quiz Service (Go)
**Location:** `backend/quiz-service/`

**Tech Stack:**
- Go 1.23
- PostgreSQL (Database: `quiz_db`)
- GORM

**Features:**
- CRUD quizzes & questions
- Quiz assignment to students
- Submit & grade quiz
- View quiz results

**API Endpoints:**
```
GET    /quizzes                - Lấy danh sách quiz
POST   /quizzes                - Tạo quiz mới (Teacher)
GET    /quizzes/:id            - Chi tiết quiz
PUT    /quizzes/:id            - Cập nhật quiz
DELETE /quizzes/:id            - Xóa quiz

POST   /quizzes/:id/questions  - Thêm câu hỏi
PUT    /questions/:id          - Sửa câu hỏi
DELETE /questions/:id          - Xóa câu hỏi

POST   /quizzes/:id/submit     - Nộp bài
GET    /quizzes/:id/result     - Xem kết quả
```

**Database:** Port 5433 (`quiz-db`)

### 4. Notification Service (Go)
**Location:** `backend/notification-service/`

**Tech Stack:**
- Go 1.23
- PostgreSQL (Database: `notification_db`)
- RabbitMQ (Message Queue)
- SMTP (Gmail)

**Features:**
- Send email notifications
- Template engine cho emails
- Queue-based email processing
- Email preferences management

**Email Templates:**
- `user_registered` - Chào mừng user mới
- `password_reset` - Reset password link
- `quiz_assigned` - Thông báo quiz mới
- `quiz_result` - Kết quả quiz

**API Endpoints:**
```
POST   /notifications          - Gửi notification mới
GET    /notifications          - Lấy danh sách notifications
PUT    /notifications/:id/read - Đánh dấu đã đọc

GET    /preferences            - Lấy email preferences
PUT    /preferences            - Cập nhật preferences
```

**Database:** Port 5435 (`notification-db`)

**RabbitMQ:** Port 5672, Management UI: 15672

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
DB_NAME=quizz

# JWT Secret
JWT_SECRET=5020f057d0d31c44d2397a3265c89b86b95a1903160610e290786cfe36e43e7b

# Frontend URL (dùng cho email reset password)
FRONTEND_URL=http://localhost  # Production: http://<server-ip>

# Email SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # 16 ký tự Gmail App Password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Quiz App
```

### Lấy Gmail App Password:
1. Vào https://myaccount.google.com/apppasswords
2. Tạo App Password mới
3. Copy 16 ký tự vào `SMTP_PASSWORD`

## 🌐 Nginx Configuration

Nginx hoạt động như API Gateway và Reverse Proxy:

```nginx
# CORS Support
- Hỗ trợ nhiều origins (localhost, server IP)
- Preflight OPTIONS handling
- Credentials support

# Routing
/                      → Frontend (port 3000)
/api/v1/auth/*         → User Auth Service (port 8080)
/api/v1/users/*        → User Auth Service (port 8080)
/api/v1/quizzes/*      → Quiz Service (port 8083)
/api/v1/questions/*    → Quiz Service (port 8083)
/api/v1/notifications/* → Notification Service (port 8082)
```

## 📊 Database Architecture

**Database per Service Pattern** - Mỗi service có database riêng:

| Service | Database | Port | Container |
|---------|----------|------|-----------|
| User Auth | `user_auth_db` | 5432 | `user-auth-db` |
| Quiz | `quiz_db` | 5433 | `quiz-db` |
| Notification | `notification_db` | 5435 | `notification-db` |

**Ưu điểm:**
- ✅ Tách biệt data, dễ scale
- ✅ Fault isolation
- ✅ Technology flexibility
- ✅ Independent deployment

## 🧪 Testing

### Test Credentials
```
Teacher Account:
Email: teacher@example.com
Password: teacher123

Student Account:
Email: student@example.com  
Password: student123
```

### API Testing (Postman/curl)

```bash
# Login
curl -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@example.com","password":"teacher123"}'

# Get Profile (với JWT token)
curl http://localhost/api/v1/users/profile \
  -H "Authorization: Bearer <jwt-token>"
```

## 📁 Project Structure

```
SE2025-17.1/
├── frontend/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   └── store/           # Zustand stores
│   └── Dockerfile
├── backend/
│   ├── user-auth-service/   # Spring Boot Auth
│   │   ├── src/
│   │   ├── schema/          # Database init SQL
│   │   └── Dockerfile
│   ├── quiz-service/        # Go Quiz Service
│   │   ├── db/              # Database init
│   │   ├── handlers/        # HTTP handlers
│   │   ├── models/          # Data models
│   │   └── Dockerfile
│   └── notification-service/ # Go Notification
│       ├── handlers/
│       ├── services/        # Email & Queue services
│       ├── templates/       # Email templates
│       └── Dockerfile
├── nginx/
│   ├── nginx.conf           # Nginx configuration
│   └── Dockerfile
├── postgres-init/           # Shared DB init scripts
├── docker-compose.yml       # Full microservices (dev)
└── docker-compose.prod.yml  # Production (4 services)
```

## 🔐 Security

- JWT-based authentication
- Password hashing (BCrypt)
- CORS protection
- Environment variables cho sensitive data
- Database per service isolation

## 🐛 Troubleshooting

### Container không start
```bash
# Xem logs
docker-compose logs <service-name>

# Restart service
docker-compose restart <service-name>

# Rebuild
docker-compose up -d --build <service-name>
```

### Email không gửi được
1. Check SMTP credentials trong `.env`
2. Verify Gmail App Password (16 ký tự)
3. Check notification-service logs:
   ```bash
   docker-compose logs notification-service
   ```

### CORS errors trên production
- Verify nginx.conf có IP server trong map directive
- Check FRONTEND_URL trong `.env`
- Rebuild nginx: `docker-compose up -d --build nginx`

### Database connection failed
```bash
# Check database health
docker-compose ps

# Restart database
docker-compose restart user-auth-db quiz-db notification-db

# Check logs
docker-compose logs postgres
```

## 📚 Documentation

- [Setup Guide](SETUP_GUIDE.md) - Hướng dẫn setup chi tiết
- [Architecture Diagram](ARCHITECTURE_DIAGRAM.md) - Sơ đồ kiến trúc
- [Database Migration](DATABASE_PER_SERVICE_MIGRATION.md) - Migration guide
- [Test Credentials](TEST_CREDENTIALS.md) - Test accounts

## 👥 Contributors

SE2025 - Group 17.1

## 📄 License

MIT License
