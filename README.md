
# Quiz Application - SE2025-17.1

Hệ thống thi trắc nghiệm trực tuyến với kiến trúc microservices.

## Goals & Objectives

### 1. Tầm nhìn sản phẩm

**Mục tiêu chính:** Xây dựng một nền tảng quiz & quản lý lớp học **đơn giản để dùng, dễ mở rộng, dễ vận hành**, phục vụ:

* Sinh viên / học sinh làm bài, xem điểm và tiến độ học tập.
* Giảng viên / giáo viên tạo đề, giao bài, theo dõi kết quả và điểm yếu của lớp.
* Admin quản lý hệ thống, cấu hình dịch vụ, theo dõi sức khỏe hệ thống.

### 2. Business Objectives

**Nâng cao chất lượng học tập**

* Cung cấp báo cáo chi tiết theo **học sinh, lớp, quiz, câu hỏi**.
* Giúp giáo viên nhanh chóng nhận diện **chủ đề/yếu tố học sinh yếu**, từ đó điều chỉnh nội dung giảng dạy.

**Tự động hoá quy trình**

* Tự động chấm điểm, tổng hợp kết quả, xuất **CSV/PDF**.
* Gửi thông báo kết quả, nhắc lịch, chứng chỉ qua **Notification Service**.
* Thiết kế sẵn cho việc chạy **job định kỳ** (weekly/monthly report, làm mới cache analytics).

**Sẵn sàng mở rộng**

* Kiến trúc microservices, mỗi service độc lập, có thể scale hoặc thay thế công nghệ riêng.
* Có thể bổ sung thêm service mới (ví dụ: Reporting Dashboard, Recommendation, LMS integration) mà không ảnh hưởng core.

## Use Case Scenarios

Hệ thống được thiết kế dựa trên các kịch bản sử dụng (Use Cases) tương ứng với 3 nhóm tác nhân chính: **Guest**, **User**, và **Admin**.

### 1. Guest (Khách)
* **Landing Page:** Truy cập trang giới thiệu và thông tin chung.
* **Registration:** Đăng ký tài khoản mới. Hệ thống sẽ kích hoạt luồng **Gửi email** để xác thực hoặc chào mừng.

### 2. User (Người dùng đã đăng nhập)
* **Authentication:**
    * **Đăng nhập:** Truy cập hệ thống.
    * **Quên mật khẩu:** Yêu cầu khôi phục mật khẩu thông qua dịch vụ **Gửi email**.
* **Account Management:** Quản lý tài khoản cá nhân (cập nhật thông tin, bảo mật).
* **Learning & Teaching:**
    * **Lớp học:** Tìm kiếm lớp học và Đăng ký tham gia (Enrollment).
    * **Quản lý nội dung:** Tạo lớp học mới, thực hiện **CRUD Quiz** (Quản lý bài thi) và **CRUD Question** (Quản lý ngân hàng câu hỏi).

### 3. Admin (Quản trị viên)
* **User Oversight:** Quản lý danh sách người dùng và Quản lý tài khoản hệ thống (Account Management).
* **System Analytics:** Quản lý Scoreboard và Ranking (Bảng xếp hạng).
* **Class & Content:** Có quyền tham gia/quản lý quy trình đăng ký lớp học và nội dung bài thi của hệ thống.

![Sơ đồ Quiz](docs/_MConverter.eu_quiz%20(1).png)
### 3. Technical Objectives

**Kiến trúc**

* Microservices rõ ràng: `user-auth-service`, `quiz-service`, `class-assignment-service`, `notification-service`, `analytics-statistic-service`, `frontend`, `nginx`.
* Sử dụng **Nginx** làm API Gateway, chuẩn hóa entrypoint `/api/v1/...` cho frontend và client.

**Chất lượng & Bảo mật**

* Xác thực bằng **JWT**, tách riêng Auth Service.
* Thực hiện **code quality & security scan** tự động trong CI (Trivy, Gosec, SpotBugs, Checkstyle, flake8, bandit, safety…).
* Cấu hình CORS, bảo vệ endpoint public/private, tách vai trò (Student/Teacher/Admin).

**Hiệu năng & Khả năng mở rộng**

* Dùng **PostgreSQL** cho dữ liệu giao dịch, sẵn sàng tích hợp **Redis** cho cache.
* Analytics sử dụng **FastAPI + Pandas**, thiết kế sẵn luồng **cache / scheduled jobs** để tối ưu khi data lớn.

**Triển khai & Vận hành (Ops)**

* Toàn bộ hệ thống đóng gói bằng **Docker**; `docker-compose.yml` cho dev, `docker-compose.prod.yml` cho production.
* **CI/CD chuẩn hoá bằng GitHub Actions**:
* Mỗi service có workflow riêng dưới `.github/workflows/`.
* Tự động build, test, scan, build Docker, push image lên **GitHub Container Registry (GHCR)**.
* **Tự động deploy production** qua SSH tới server khi push lên `main`.


* Script deploy trên server xử lý:
* Pull code mới, ensure `.env` và `frontend/.env.production` đúng IP server.
* Đăng nhập GHCR, pull image đúng tag.
* `docker compose -f docker-compose.prod.yml up -d <service>` và health check sau deploy.



### 4. Phạm vi chức năng chính (Scope)

**User Auth Service**

* Đăng ký / đăng nhập, refresh token, quên mật khẩu, reset mật khẩu.
* Quản lý thông tin user, phân quyền cơ bản.

**Quiz Service**

* CRUD quiz & câu hỏi, gán quiz cho học sinh/lớp.
* Học sinh làm bài, nộp bài, tính điểm và lưu kết quả.

**Class Assignment Service**

* Quản lý lớp, danh sách thành viên, gán bài cho lớp.
* Theo dõi tiến độ hoàn thành trên từng lớp.

**Notification Service**

* Gửi email transactional: đăng ký, reset password, quiz được giao, kết quả quiz…
* Thiết kế sẵn để nhận event từ các service khác (ví dụ quiz_submitted, certificate_generated).

**Analytics & Statistic Service**

* Phân tích kết quả theo quiz, học sinh, lớp, câu hỏi.
* Tính toán các chỉ số thống kê (mean, median, percentiles, histogram…).
* Phân tích theo topic/difficulty để tìm điểm yếu.
* Xuất báo cáo CSV/PDF, nền tảng để sinh chứng chỉ.

**Frontend (Next.js)**

* Giao diện cho người dùng cuối: đăng nhập, làm bài, xem kết quả.
* Dashboard cho giáo viên / admin: quản lý quiz, lớp, xem analytics.
* Tích hợp tất cả API qua Nginx (`/api/v1/...`), có module **Analytics & Reports** với biểu đồ và bảng.

---

## Tổng quan

Ứng dụng quiz online cho phép giảng viên tạo bài thi, học sinh làm bài và nhận thông báo qua email. Được xây dựng theo kiến trúc microservices với database riêng biệt cho từng service.

## Kiến trúc

### Microservices

* **Frontend** (Next.js + TypeScript) - Port 3000
* **User Auth Service** (Spring Boot + Java) - Port 8080
* **Quiz Service** (Go) - Port 8083
* **Notification Service** (Go) - Port 8082

### Infrastructure

* **Nginx** - API Gateway & Reverse Proxy (Port 80)
* **PostgreSQL** - Database per Service pattern
* **Redis** - Caching layer
* **RabbitMQ** - Message queue cho notifications

## Quick Start

### Prerequisites

* Docker & Docker Compose
* Git



## Services Chi tiết

### 1. Frontend (Next.js)

* **Location:** `frontend/`
* **Tech Stack:** Next.js 15 (App Router), TypeScript, TailwindCSS + shadcn/ui, Zustand (State management).
* **Features:** Authentication (Login/Register/Forgot Password), Quiz management UI, Real-time notifications, Responsive design.
* **API Integration:**
```typescript
// Base URL
NEXT_PUBLIC_API_URL=http://localhost/api/v1

```



### 2. User Auth Service (Spring Boot)

* **Location:** `backend/user-auth-service/`
* **Tech Stack:** Java 17 + Spring Boot 3.x, Spring Security + JWT, PostgreSQL (Database: `user_auth_db`).
* **Features:** User registration & login, JWT token authentication, Password reset via email, Role-based access control (USER/ADMIN).
* **API Endpoints:**
```text
POST   /auth/register          - Đăng ký user mới
POST   /auth/login             - Đăng nhập
POST   /auth/refresh           - Refresh JWT token
POST   /auth/forgot-password   - Yêu cầu reset password
POST   /auth/reset-password    - Reset password với token
GET    /users/profile          - Lấy thông tin user
PUT    /users/profile          - Cập nhật profile

```


* **Database:** Port 5432 (`user-auth-db`)

### 3. Quiz Service (Go)

* **Location:** `backend/quiz-service/`
* **Tech Stack:** Go 1.23, PostgreSQL (Database: `quiz_db`), GORM.
* **Features:** CRUD quizzes & questions, Quiz assignment to students, Submit & grade quiz, View quiz results.
* **API Endpoints:**
```text
GET    /quizzes                - Lấy danh sách quiz
POST   /quizzes                - Tạo quiz mới (User/Admin)
GET    /quizzes/:id            - Chi tiết quiz
PUT    /quizzes/:id            - Cập nhật quiz
DELETE /quizzes/:id            - Xóa quiz

POST   /quizzes/:id/questions  - Thêm câu hỏi
PUT    /questions/:id          - Sửa câu hỏi
DELETE /questions/:id          - Xóa câu hỏi

POST   /quizzes/:id/submit     - Nộp bài
GET    /quizzes/:id/result     - Xem kết quả

```


## Security

* JWT-based authentication.
* Password hashing (BCrypt).
* CORS protection.
* Environment variables cho sensitive data.
* Database per service isolation.

## Troubleshooting

**Container không start**

* Xem logs: `docker-compose logs <service-name>`
* Restart service: `docker-compose restart <service-name>`
* Rebuild: `docker-compose up -d --build <service-name>`

**Email không gửi được**

* Check SMTP credentials trong `.env`.
* Verify Gmail App Password (16 ký tự).
* Check notification-service logs: `docker-compose logs notification-service`.

**CORS errors trên production**

* Verify nginx.conf có IP server trong map directive.
* Check FRONTEND_URL trong `.env`.
* Rebuild nginx: `docker-compose up -d --build nginx`.

**Database connection failed**

* Check database health: `docker-compose ps`
* Restart database: `docker-compose restart user-auth-db quiz-db notification-db`

* *Setup & Deploy:* xem DEPLOY.md

* *Video Demo:* 
  * https://drive.google.com/drive/folders/1MoJE76vzGAZUolf9X2cId5zkBZEiRolN?usp=drive_link

## Contributors

SE2025 - Group 17.1
