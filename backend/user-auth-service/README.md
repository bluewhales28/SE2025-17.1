# User & Auth Service

Microservice Spring Boot cho hệ thống quản lý người dùng và xác thực với JWT. Service quản lý authentication, authorization và user profile.

## Tính năng (Features)

- **Đăng ký & Xác thực người dùng**
  - Đăng ký người dùng mới
  - Đăng nhập với JWT token
  - Đăng xuất và vô hiệu hóa token
  - Refresh token để gia hạn phiên làm việc
  - Token introspection để kiểm tra tính hợp lệ

- **Quản lý mật khẩu**
  - Mã hóa mật khẩu an toàn bằng BCrypt

- **Phân quyền dựa trên vai trò (RBAC)**
  - 2 vai trò: USER và ADMIN
  - Hệ thống phân quyền chi tiết theo từng hành động
  - JWT token chứa thông tin quyền truy cập

- **Quản lý hồ sơ người dùng**
  - Xem profile hiện tại
  - Cập nhật profile cá nhân
  - Admin quản lý tất cả users

## Database Requirements

### PostgreSQL Database

Service này sử dụng **PostgreSQL** để lưu trữ dữ liệu.

Các bảng được tạo tự động bởi Hibernate:

1. **users** - Bảng lưu thông tin người dùng
   - `id` (BIGSERIAL PRIMARY KEY)
   - `email` (VARCHAR, UNIQUE, NOT NULL)
   - `password_hash` (VARCHAR, NOT NULL)
   - `full_name` (VARCHAR, NOT NULL)
   - `phone_number` (VARCHAR)
   - `date_of_birth` (DATE)
   - `gender` (VARCHAR - MALE/FEMALE)
   - `is_email_verified` (BOOLEAN, NOT NULL) - Luôn là `true` khi tạo user mới
   - `role` (VARCHAR, NOT NULL - USER/ADMIN)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

2. **invalid_tokens** - Bảng lưu token đã logout
   - `id` (BIGSERIAL PRIMARY KEY)
   - `token` (VARCHAR, UNIQUE, NOT NULL)
   - `expiration_time` (TIMESTAMP, NOT NULL)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

### Configuration

Database được cấu hình trong `application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/movieweb
    username: postgres
    password: 123456
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Mô tả | Quyền truy cập |
|--------|----------|-------|----------------|
| POST | `/auth/login` | Đăng nhập user | Public |
| POST | `/auth/logout` | Đăng xuất user | Public |
| POST | `/auth/refresh` | Làm mới JWT token | Public |
| POST | `/auth/introspect` | Kiểm tra tính hợp lệ của JWT token | Public |

### User Management Endpoints

| Method | Endpoint | Mô tả | Quyền truy cập |
|--------|----------|-------|----------------|
| POST | `/users` | Tạo user mới (đăng ký) | Public |
| GET | `/users?fullName={name}&page={p}&size={s}` | Tìm user theo tên (phân trang) | `user:read` |
| GET | `/users/all?page={p}&size={s}&sortBy={field}` | Lấy tất cả users (phân trang) | `admin:read` |
| GET | `/users/profile` | Lấy profile user hiện tại | Authenticated |
| PUT | `/users/profile` | Cập nhật profile user hiện tại | Authenticated |
| PUT | `/users/{id}` | Cập nhật user theo ID | `user:write` hoặc `admin:write` |

## Ví dụ Request/Response

### Login Request
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "passwordHash": "password123"
}
```

### Login Response
```json
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "authenticated": true
  }
}
```

### User Registration Request
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

**Lưu ý**: Field `is_email_verified` sẽ tự động được set thành `true` khi tạo user mới.

## Setup & Run

### 1. Setup PostgreSQL Database

```bash
# Chạy PostgreSQL bằng Docker
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=movieweb \
  -p 5432:5432 \
  postgres:latest
```

### 2. Update Configuration

Cập nhật thông tin database trong `src/main/resources/application.yml` nếu cần:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/movieweb
    username: postgres
    password: your_password
```

### 3. Run Application

```bash
# Sử dụng Maven wrapper
./mvnw spring-boot:run

# Hoặc sử dụng Maven
mvn spring-boot:run

# Hoặc build và chạy JAR
mvn clean package
java -jar target/user-auth-service-0.0.1-SNAPSHOT.jar
```

Service sẽ chạy tại: `http://localhost:8080`

### 4. API Documentation

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API Docs**: http://localhost:8080/v3/api-docs

## Security

### Password Security
- Sử dụng BCrypt để hash mật khẩu
- Không bao giờ lưu mật khẩu dạng plain text

### JWT Token Security
- Token được ký bằng thuật toán HMAC-SHA512
- Thời gian hết hạn mặc định: 24 giờ
- Vô hiệu hóa token khi đăng xuất
- Cơ chế refresh token để gia hạn phiên

### Role-Based Access Control

**USER Role:**
- `user:read` - Đọc profile của bản thân
- `quiz:read` - Đọc các quiz
- `quiz:write` - Tạo và chỉnh sửa quiz (bao gồm quản lý lớp học)

**ADMIN Role:**
- Bao gồm tất cả quyền của USER
- `admin:read`, `admin:write`, `admin:delete`
- `user:write`, `user:delete`
- `quiz:delete` - Xóa quiz

## Dependencies

- Spring Boot 3.5.6
- Spring Security
- Spring Data JPA
- PostgreSQL Driver
- Nimbus JWT
- Lombok
- MapStruct
- SpringDoc OpenAPI

## Project Structure

```
src/main/java/com/quizapp/user_auth_service/
├── config/              # Cấu hình (Security, JWT)
├── controller/          # REST API Controllers
├── dto/                # Data Transfer Objects
├── exception/          # Exception handling
├── mapper/             # MapStruct mappers
├── model/              # Entity models
├── repository/         # JPA Repositories
├── service/            # Business logic
└── untils/             # Utilities (Enums: Role, Permission, Gender)
```

## License

MIT License