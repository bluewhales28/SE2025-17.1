# User & Auth Service

Microservice Spring Boot cho hệ thống quản lý người dùng và xác thực với JWT. Service quản lý authentication, authorization và user profile cho Quiz App.

## 📋 Mục lục

- [Tính năng](#tính-năng-features)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Setup & Run](#setup--run)
- [Docker](#docker)
- [Security](#security)
- [Dependencies](#dependencies)
- [Project Structure](#project-structure)

## ✨ Tính năng (Features)

### Authentication & Authorization
- ✅ **Đăng ký người dùng mới** - Tạo tài khoản với email và password
- ✅ **Đăng nhập với JWT** - Xác thực và nhận JWT token
- ✅ **Đăng xuất** - Vô hiệu hóa token
- ✅ **Refresh Token** - Gia hạn phiên làm việc
- ✅ **Token Introspection** - Kiểm tra tính hợp lệ của token
- ✅ **Quên mật khẩu** - Gửi email reset password
- ✅ **Đặt lại mật khẩu** - Reset password với token

### User Management
- ✅ **Quản lý profile** - Xem và cập nhật thông tin cá nhân
- ✅ **Tìm kiếm user** - Tìm user theo tên với phân trang
- ✅ **Quản lý users (Admin)** - Xem tất cả users với phân trang và sắp xếp
- ✅ **Cập nhật user** - Admin có thể cập nhật thông tin user

### Security
- ✅ **BCrypt Password Hashing** - Mã hóa mật khẩu an toàn
- ✅ **JWT Token** - HMAC-SHA512 signing
- ✅ **Role-Based Access Control (RBAC)** - 3 roles: USER, TEACHER, ADMIN
- ✅ **Permission System** - Phân quyền chi tiết theo từng hành động

## 🗄️ Database Schema

Service sử dụng **PostgreSQL** để lưu trữ dữ liệu. Các bảng được tạo tự động bởi Hibernate JPA.

### 1. **users** - Bảng lưu thông tin người dùng

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | PRIMARY KEY | ID tự động tăng |
| `email` | VARCHAR | UNIQUE, NOT NULL | Email đăng nhập |
| `password_hash` | VARCHAR | NOT NULL | Mật khẩu đã hash bằng BCrypt |
| `full_name` | VARCHAR | NOT NULL | Họ và tên |
| `phone_number` | VARCHAR | NULL | Số điện thoại |
| `date_of_birth` | DATE | NULL | Ngày sinh |
| `gender` | VARCHAR | NULL | Giới tính (MALE/FEMALE) |
| `is_email_verified` | BOOLEAN | NOT NULL, DEFAULT true | Trạng thái xác thực email |
| `role` | VARCHAR | NOT NULL | Vai trò (USER/TEACHER/ADMIN) |
| `created_at` | TIMESTAMP | NOT NULL | Thời gian tạo |
| `updated_at` | TIMESTAMP | NOT NULL | Thời gian cập nhật |

### 2. **invalid_tokens** - Bảng lưu token đã logout

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | PRIMARY KEY | ID tự động tăng |
| `token` | VARCHAR | UNIQUE, NOT NULL | JWT token đã logout |
| `expiration_time` | TIMESTAMP | NOT NULL | Thời gian hết hạn token |
| `created_at` | TIMESTAMP | NOT NULL | Thời gian tạo |
| `updated_at` | TIMESTAMP | NOT NULL | Thời gian cập nhật |

### 3. **password_reset_tokens** - Bảng lưu token reset password

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | PRIMARY KEY | ID tự động tăng |
| `user_id` | BIGINT | FOREIGN KEY, NOT NULL | ID của user |
| `token` | VARCHAR | UNIQUE, NOT NULL | Token reset password |
| `expiration_time` | TIMESTAMP | NOT NULL | Thời gian hết hạn token |
| `used` | BOOLEAN | NOT NULL, DEFAULT false | Đã sử dụng hay chưa |
| `created_at` | TIMESTAMP | NOT NULL | Thời gian tạo |
| `updated_at` | TIMESTAMP | NOT NULL | Thời gian cập nhật |

## 🔌 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Mô tả | Quyền truy cập |
|--------|----------|-------|----------------|
| POST | `/auth/login` | Đăng nhập và nhận JWT token | Public |
| POST | `/auth/logout` | Đăng xuất và vô hiệu hóa token | Public |
| POST | `/auth/refresh` | Làm mới JWT token | Public |
| POST | `/auth/introspect` | Kiểm tra tính hợp lệ của token | Public |
| POST | `/auth/forgot-password` | Gửi email reset password | Public |
| POST | `/auth/reset-password` | Đặt lại mật khẩu với token | Public |

### User Management Endpoints

| Method | Endpoint | Mô tả | Quyền truy cập |
|--------|----------|-------|----------------|
| POST | `/users` | Tạo user mới (đăng ký) | Public |
| GET | `/users?fullName={name}&page={p}&size={s}` | Tìm user theo tên (phân trang) | `user:read` |
| GET | `/users/all?page={p}&size={s}&sortBy={field}` | Lấy tất cả users (phân trang) | `admin:read` |
| GET | `/users/profile` | Lấy profile user hiện tại | Authenticated |
| PUT | `/users/profile` | Cập nhật profile user hiện tại | Authenticated |
| PUT | `/users/{id}` | Cập nhật user theo ID | `user:write` hoặc `admin:write` |

## 📝 Ví dụ Request/Response

### 1. Đăng ký User

**Request:**
```bash
POST /users
Content-Type: application/json

{
  "email": "user@example.com",
  "passwordHash": "password123",
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0987654321",
  "dateOfBirth": "1990-01-15",
  "gender": "MALE",
  "role": "USER"
}
```

**Response:**
```json
{
  "status": 201,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0987654321",
    "dateOfBirth": "1990-01-15",
    "gender": "MALE",
    "role": "USER",
    "isEmailVerified": true,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
}
```

### 2. Đăng nhập

**Request:**
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "passwordHash": "password123"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwiZXhwIjoxNzA1MzIxNjAwfQ...",
    "authenticated": true
  }
}
```

### 3. Lấy Profile

**Request:**
```bash
GET /users/profile
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": 200,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0987654321",
    "dateOfBirth": "1990-01-15",
    "gender": "MALE",
    "role": "USER",
    "isEmailVerified": true
  }
}
```

### 4. Quên mật khẩu

**Request:**
```bash
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Password reset email queued"
}
```

### 5. Đặt lại mật khẩu

**Request:**
```bash
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "newPassword123"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Password reset successful"
}
```

## 🚀 Setup & Run

### Prerequisites

- Java 17+
- Maven 3.6+
- PostgreSQL 12+
- Docker & Docker Compose (optional)

### Cách 1: Chạy với Docker Compose (Khuyến nghị)

```bash
# Từ thư mục devops/docker
cd devops/docker

# Tạo file .env
cat > .env << EOF
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_DB=quizz
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NEXT_PUBLIC_API_URL=http://localhost/api/v1
EOF

# Build và chạy
docker-compose up -d --build

# Xem logs
docker-compose logs -f user-auth-service
```

### Cách 2: Chạy với Docker thủ công

```bash
# Build image
cd backend/user-auth-service
docker build -t user-auth-service:latest .

# Chạy container
docker run -d \
  --name user-auth-service \
  --network host \
  -e SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/quizz" \
  -e SPRING_DATASOURCE_USERNAME="admin" \
  -e SPRING_DATASOURCE_PASSWORD="admin123" \
  -e JWT_SECRET="changeme-to-a-long-secret" \
  --restart unless-stopped \
  user-auth-service:latest
```

### Cách 3: Chạy trực tiếp (Development)

#### 1. Setup PostgreSQL

```bash
docker run -d --name postgres18 \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin123 \
  -e POSTGRES_DB=quizz \
  -p 5432:5432 \
  postgres:18
```

#### 2. Cấu hình application.yml

Cập nhật thông tin database trong `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/quizz
    username: admin
    password: admin123
```

#### 3. Chạy ứng dụng

```bash
# Sử dụng Maven wrapper
./mvnw spring-boot:run

# Hoặc sử dụng Maven
mvn spring-boot:run

# Hoặc build và chạy JAR
mvn clean package
java -jar target/user-auth-service-0.0.1-SNAPSHOT.jar
```

Service sẽ chạy tại: **http://localhost:8082**

## 🐳 Docker

### Build Docker Image

```bash
cd backend/user-auth-service
docker build -t user-auth-service:latest .
```

### Docker Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | PostgreSQL connection URL | `jdbc:postgresql://localhost:5432/quizz` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `password` |
| `SPRING_RABBITMQ_HOST` | RabbitMQ host (optional) | `localhost` |
| `SPRING_RABBITMQ_PORT` | RabbitMQ port (optional) | `5672` |
| `SPRING_DATA_REDIS_HOST` | Redis host (optional) | `localhost` |
| `SPRING_DATA_REDIS_PORT` | Redis port (optional) | `6379` |
| `JWT_SECRET` | Secret key for JWT signing | (required) |
| `APP_NOTIFICATION_SERVICE_URL` | Notification service URL (optional) | `http://notification-service:8080` |

## 🔒 Security

### Password Security
- ✅ Sử dụng **BCrypt** để hash mật khẩu với salt tự động
- ✅ Không bao giờ lưu mật khẩu dạng plain text
- ✅ Password reset token có thời gian hết hạn (24 giờ)

### JWT Token Security
- ✅ Token được ký bằng thuật toán **HMAC-SHA512**
- ✅ Thời gian hết hạn mặc định: **24 giờ**
- ✅ Vô hiệu hóa token khi đăng xuất (lưu vào `invalid_tokens`)
- ✅ Cơ chế refresh token để gia hạn phiên
- ✅ Token introspection để kiểm tra tính hợp lệ

### Role-Based Access Control (RBAC)

#### **USER Role:**
- `user:read` - Đọc profile của bản thân
- `quiz:read` - Đọc các quiz

#### **TEACHER Role:**
- Tất cả quyền của USER
- `user:read` - Đọc thông tin user
- `quiz:read` - Đọc các quiz
- `quiz:write` - Tạo và chỉnh sửa quiz

#### **ADMIN Role:**
- Tất cả quyền của USER và TEACHER
- `admin:read`, `admin:write`, `admin:delete`
- `user:write`, `user:delete` - Quản lý users
- `quiz:delete` - Xóa quiz

## 📦 Dependencies

- **Spring Boot** 3.5.6
- **Spring Security** - Authentication & Authorization
- **Spring Data JPA** - Database access
- **PostgreSQL Driver** - Database connection
- **Nimbus JWT** - JWT token handling
- **Lombok** - Reduce boilerplate code
- **MapStruct** - Object mapping
- **SpringDoc OpenAPI** - API documentation
- **Spring AMQP** - RabbitMQ integration (optional)
- **Spring Data Redis** - Redis integration (optional)

## 📁 Project Structure

```
src/main/java/com/quizapp/user_auth_service/
├── config/              # Cấu hình (Security, JWT, RabbitMQ)
│   ├── SecurityConfig.java
│   ├── CustomJwtDecoder.java
│   └── RabbitConfig.java
├── controller/          # REST API Controllers
│   ├── AuthenticationController.java
│   └── UserController.java
├── dto/                # Data Transfer Objects
│   ├── request/        # Request DTOs
│   └── response/       # Response DTOs
├── exception/          # Exception handling
│   ├── AppException.java
│   ├── ErrorCode.java
│   └── GlobalException.java
├── mapper/             # MapStruct mappers
│   └── UserMapper.java
├── model/              # Entity models
│   ├── User.java
│   ├── InvalidToken.java
│   └── PasswordResetToken.java
├── repository/         # JPA Repositories
│   ├── UserRepository.java
│   ├── InvalidTokenRepository.java
│   └── PasswordResetTokenRepository.java
├── service/            # Business logic
│   ├── impl/
│   │   ├── AuthenticationServiceImpl.java
│   │   ├── UserServiceImpl.java
│   │   └── PasswordResetServiceImpl.java
│   ├── UserService.java
│   ├── PasswordService.java
│   └── RolePermissionService.java
├── queue/              # Message queue producers
│   └── EmailQueueProducer.java
├── schedule/           # Scheduled tasks
│   └── PasswordResetTokenCleanupTask.java
└── untils/             # Utilities (Enums: Role, Permission, Gender)
```

## 📚 API Documentation

Khi service đang chạy, truy cập:

- **Swagger UI**: http://localhost:8082/swagger-ui.html
- **API Docs (JSON)**: http://localhost:8082/v3/api-docs
- **API Docs (YAML)**: http://localhost:8082/v3/api-docs.yaml

## 🐛 Troubleshooting

### Container không start được

1. Kiểm tra logs:
```bash
docker logs user-auth-service
```

2. Kiểm tra database connection:
```bash
docker exec -it postgres18 psql -U admin -d quizz
```

3. Kiểm tra network:
```bash
docker network inspect app-network
```

### Port đã được sử dụng

Nếu port 8082 đã được sử dụng:
- Thay đổi port trong `application.yml`: `server.port: 8083`
- Hoặc dừng service đang dùng port đó

### Database connection failed

- Kiểm tra PostgreSQL đang chạy: `docker ps | grep postgres`
- Kiểm tra credentials trong `application.yml`
- Kiểm tra database đã được tạo chưa

## 📄 License

MIT License
