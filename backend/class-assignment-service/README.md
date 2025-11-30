# Class & Assignment Service

Microservice quản lý lớp học, học sinh và giao bài quiz. Service này tích hợp với Quiz Service và Notification Service để cung cấp đầy đủ chức năng quản lý lớp học và bài tập.

## Tính năng chính

### 1. Quản lý Lớp học (Class Management)
- ✅ Tạo và cập nhật lớp học
- ✅ Xem danh sách lớp theo vai trò (teacher/student)
- ✅ Quản lý mã mời và link mời
- ✅ Phân quyền: Teacher (toàn quyền), Student (tham gia và làm bài)
- ✅ Tham gia lớp qua mã mời

### 2. Quản lý Thành viên (Class Members)
- ✅ Thêm/xóa thành viên
- ✅ Quản lý vai trò (Teacher/Student)
- ✅ Kiểm tra quyền truy cập
- ✅ Bảo vệ không xóa teacher cuối cùng

### 3. Giao bài & Bài tập (Assignments)
- ✅ Tạo assignment từ Quiz Service
- ✅ Quản lý thời gian mở (`start_time`) và hạn nộp (`due_time`)
- ✅ Theo dõi trạng thái: NOT_STARTED, IN_PROGRESS, SUBMITTED, OVERDUE
- ✅ Đồng bộ điểm từ Quiz Service sau khi học sinh nộp bài
- ✅ Hỗ trợ nhiều lần làm lại (`allow_multiple_attempts`)

### 4. Tiến độ Học sinh (Student Progress)
- ✅ Theo dõi tiến độ từng học sinh cho mỗi assignment
- ✅ Lưu trữ điểm số và trạng thái
- ✅ Liên kết với quiz attempt từ Quiz Service

### 5. Bảng xếp hạng (Leaderboard)
- ✅ Hiển thị bảng điểm của lớp
- ✅ Tính toán từ `student_progress` table
- ✅ Cache trong Redis để tăng tốc độ truy vấn
- ✅ Sắp xếp theo tổng điểm và điểm trung bình

### 6. Báo cáo & Thống kê (Reports)
- ✅ Tổng quan lớp: số lượng quiz, điểm trung bình
- ✅ Báo cáo chi tiết từng quiz trong lớp
- ✅ Tiến độ từng học sinh
- ✅ Thống kê tỷ lệ hoàn thành

### 7. Nhắc hạn & Thông báo
- ✅ Gửi thông báo khi có quiz mới
- ✅ Deadline reminder tự động (chạy hàng ngày lúc 9h sáng)
- ✅ Tích hợp với Notification Service

## Công nghệ sử dụng

- **Framework**: Spring Boot 3.5.7
- **Java**: 17
- **Database**: PostgreSQL
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **Security**: JWT Authentication
- **ORM**: JPA/Hibernate
- **Mapping**: MapStruct
- **Testing**: JUnit, Mockito

## Cấu trúc dự án

```
src/main/java/com/example/class_assignment_service/
├── config/              # Configuration (Security, Redis, RabbitMQ, WebClient)
├── controller/         # REST Controllers
├── dto/                # Data Transfer Objects
│   ├── request/        # Request DTOs
│   └── response/       # Response DTOs
├── exception/          # Exception handling
├── model/             # Entity models
│   └── enums/         # Enumerations (ClassRole, ClassStatus, AssignmentStatus)
├── repository/        # JPA Repositories
├── service/           # Business logic
├── client/            # External service clients (QuizService, NotificationService)
├── listener/           # RabbitMQ listeners
├── scheduler/          # Scheduled jobs
└── util/              # Utility classes
```

## Database Schema

Service sử dụng các bảng sau từ database:

### `classes`
- `id`: Primary key
- `name`: Tên lớp
- `description`: Mô tả
- `topic`: Chủ đề
- `status`: Trạng thái (ACTIVE, INACTIVE, ARCHIVED)
- `teacher_id`: ID giáo viên
- `invitation_code`: Mã mời (unique)
- `created_at`, `updated_at`: Timestamps

### `class_members`
- `id`: Primary key
- `class_id`: Foreign key to classes
- `user_id`: Foreign key to users
- `role`: Vai trò (TEACHER hoặc STUDENT) - enum `class_role_enum`
- `joined_at`: Thời gian tham gia
- Unique constraint: (class_id, user_id)

### `assignments`
- `id`: Primary key
- `class_id`: Foreign key to classes
- `quiz_id`: Foreign key to quizzes (Quiz Service)
- `title`: Tiêu đề bài tập
- `description`: Mô tả
- `start_time`: Thời gian bắt đầu
- `due_time`: Hạn nộp
- `allow_multiple_attempts`: Cho phép làm nhiều lần
- `max_score`: Điểm tối đa
- `created_at`, `updated_at`: Timestamps

### `student_progress`
- `id`: Primary key
- `assignment_id`: Foreign key to assignments
- `student_id`: Foreign key to users
- `status`: Trạng thái (NOT_STARTED, IN_PROGRESS, SUBMITTED, OVERDUE)
- `score`: Điểm số (INT)
- `attempt_id`: ID của quiz attempt từ Quiz Service
- `last_updated`: Thời gian cập nhật cuối
- Unique constraint: (assignment_id, student_id)

## API Endpoints

### Classes

#### Tạo lớp học
```http
POST /api/classes
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Lớp Toán 10A1",
  "description": "Lớp toán nâng cao",
  "subject": "Toán học"
}
```

#### Lấy danh sách lớp
```http
GET /api/classes?role=TEACHER
Authorization: Bearer <token>
```

#### Lấy thông tin lớp
```http
GET /api/classes/{id}
Authorization: Bearer <token>
```

#### Cập nhật lớp
```http
PUT /api/classes/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Lớp Toán 10A1 - Updated",
  "status": "ACTIVE"
}
```

#### Xóa lớp
```http
DELETE /api/classes/{id}
Authorization: Bearer <token>
```

#### Tạo lại mã mời
```http
POST /api/classes/{id}/regenerate-invitation
Authorization: Bearer <token>
```

#### Tham gia lớp qua mã mời
```http
POST /api/classes/join?invitationCode=MATH10A1
Authorization: Bearer <token>
```

### Class Members

#### Thêm thành viên
```http
POST /api/classes/{classId}/members
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": 4,
  "role": "STUDENT"
}
```

#### Lấy danh sách thành viên
```http
GET /api/classes/{classId}/members
Authorization: Bearer <token>
```

#### Cập nhật vai trò thành viên
```http
PUT /api/classes/{classId}/members/{memberId}/role
Content-Type: application/json
Authorization: Bearer <token>

{
  "role": "TEACHER"
}
```

#### Xóa thành viên
```http
DELETE /api/classes/{classId}/members/{memberId}
Authorization: Bearer <token>
```

### Assignments

#### Tạo assignment
```http
POST /api/assignments
Content-Type: application/json
Authorization: Bearer <token>

{
  "classId": 1,
  "quizId": 1,
  "title": "Bài tập tuần 1",
  "description": "Hoàn thành bài kiểm tra",
  "deadline": "2025-12-01T23:59:59",
  "openTime": "2025-11-25T00:00:00",
  "allowRetake": true,
  "maxAttempts": 3
}
```

#### Lấy danh sách assignment của lớp
```http
GET /api/assignments/class/{classId}
Authorization: Bearer <token>
```

#### Lấy thông tin assignment
```http
GET /api/assignments/{id}
Authorization: Bearer <token>
```

#### Bắt đầu làm bài
```http
POST /api/assignments/{id}/start
Authorization: Bearer <token>
```

### Invitations

#### Chấp nhận lời mời
```http
POST /api/invitations/accept
Content-Type: application/json
Authorization: Bearer <token>

{
  "invitationCode": "MATH10A1"
}
```

### Leaderboard

#### Lấy bảng xếp hạng
```http
GET /api/leaderboard/class/{classId}
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "classId": 1,
    "className": "Lớp Toán 10A1",
    "entries": [
      {
        "userId": 4,
        "totalScore": 95.0,
        "averageScore": 95.0,
        "completedAssignments": 1,
        "totalAssignments": 1,
        "rank": 1,
        "completionRate": 100.0
      }
    ],
    "totalStudents": 3,
    "totalAssignments": 1
  }
}
```

### Reports

#### Lấy báo cáo lớp
```http
GET /api/reports/class/{classId}
Authorization: Bearer <token>
```

## Cấu hình

### application.yml

```yaml
spring:
  application:
    name: class-assignment-service
  
  datasource:
    url: jdbc:postgresql://localhost:5432/quizz
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
  
  data:
    redis:
      host: localhost
      port: 6379
      timeout: 2000ms
  
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest

app:
  jwt:
    secret: 5020f057d0d31c44d2397a3265c89b86b95a1903160610e290786cfe36e43e7b
    expiration: 86400000 # 24 hours
  
  services:
    quiz-service:
      url: http://localhost:8082
    notification-service:
      url: http://localhost:8083

server:
  port: 8084
```

## Chạy ứng dụng

### Yêu cầu
- Java 17+
- PostgreSQL 12+
- Redis 6+ (chạy trong Docker)
- RabbitMQ 3.8+ (chạy trong Docker)

### Kiểm tra Docker Containers

Đảm bảo Redis và RabbitMQ đang chạy:

```bash
# Kiểm tra containers
docker ps

# Redis nên chạy trên port 6379
# RabbitMQ nên chạy trên port 5672 (và management UI trên 15672)
```

Nếu chưa có, khởi động containers:

```bash
# Redis
docker run -d --name my-redis -p 6379:6379 redis

# RabbitMQ với Management UI
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

### Build và chạy

```bash
# Build
mvn clean install

# Chạy
mvn spring-boot:run
```

Service sẽ tự động kết nối với:
- **Redis**: `localhost:6379`
- **RabbitMQ**: `localhost:5672` (Management UI: `http://localhost:15672`)

## Tích hợp với các service khác

### Quiz Service
- **Lấy thông tin quiz**: Khi tạo assignment, service sẽ verify quiz tồn tại
- **Đồng bộ điểm**: Nhận event `quiz.submitted` từ RabbitMQ để cập nhật điểm vào `student_progress`
- **Endpoint**: `http://localhost:8082`

### Notification Service
- **Gửi thông báo assignment mới**: Khi teacher tạo assignment, tự động gửi thông báo cho tất cả students
- **Deadline reminder**: Scheduled job gửi nhắc hạn 24h trước deadline
- **Endpoint**: `http://localhost:8083`

## Security

### JWT Authentication
- Tất cả endpoints (trừ public) yêu cầu JWT token trong header:
  ```
  Authorization: Bearer <token>
  ```
- Token được validate và extract user ID từ `subject` claim
- Role được lấy từ `role` claim trong token

### Role-Based Access Control (RBAC)

#### Teacher
- Tạo, cập nhật, xóa lớp
- Thêm/xóa thành viên
- Tạo assignment
- Xem báo cáo
- Quản lý mã mời

#### Student
- Xem lớp đã tham gia
- Xem danh sách assignment
- Bắt đầu làm bài
- Xem leaderboard
- Tham gia lớp qua mã mời

## Scheduled Jobs

### Deadline Reminder
- **Schedule**: Chạy hàng ngày lúc 9:00 AM
- **Chức năng**: Gửi thông báo nhắc hạn cho học sinh chưa nộp bài có deadline trong 24h tới
- **Class**: `DeadlineReminderScheduler`

## Message Queue Events

### Consumed Events

#### `quiz.submitted`
Khi học sinh nộp quiz từ Quiz Service:
```json
{
  "quizAttemptId": 123,
  "quizId": 1,
  "userId": 4,
  "score": 95.0,
  "maxScore": 100.0
}
```

Service sẽ:
1. Tìm `student_progress` có `attempt_id` tương ứng
2. Cập nhật `score` và `status = SUBMITTED`
3. Cập nhật leaderboard cache

## Testing

### Unit Tests
```bash
mvn test
```

### Integration Tests
```bash
mvn verify
```

### Test với H2 Database
Service hỗ trợ H2 database cho testing. Cấu hình trong `application-test.yml`.

## Error Handling

Service sử dụng global exception handler với các error codes:

- `CLASS_NOT_FOUND` (404)
- `MEMBER_ALREADY_EXISTS` (409)
- `UNAUTHORIZED_CLASS_ACCESS` (403)
- `ASSIGNMENT_NOT_FOUND` (404)
- `ASSIGNMENT_CLOSED` (400)
- `INVITATION_CODE_INVALID` (400)
- `QUIZ_NOT_FOUND` (404)
- `QUIZ_SERVICE_ERROR` (503)

## Performance

### Redis Caching
- Leaderboard được cache trong Redis với TTL 10 phút
- Cache key: `leaderboard:{classId}`

### Database Indexing
Các indexes được tạo tự động:
- `classes.invitation_code` (unique)
- `class_members(class_id, user_id)` (unique)
- `student_progress(assignment_id, student_id)` (unique)

## Monitoring

### Actuator Endpoints
- Health check: `GET /actuator/health`
- Metrics: `GET /actuator/metrics`

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra PostgreSQL đang chạy
- Verify connection string trong `application.yml`

### Lỗi kết nối Redis
- Kiểm tra Redis đang chạy: `redis-cli ping`
- Verify host và port trong config

### Lỗi kết nối RabbitMQ
- Kiểm tra RabbitMQ đang chạy
- Verify credentials trong config

### Lỗi JWT
- Kiểm tra secret key khớp với Auth Service
- Verify token chưa hết hạn

## License

MIT

## Contributors

- Development Team
