# Postman Endpoints - Class & Assignment Service

Danh sách đầy đủ các endpoints để tự tạo trên Postman.

## Base URL
```
http://localhost:8084
```

## Variables cần tạo
- `base_url`: http://localhost:8084
- `jwt_token`: Token từ Auth Service
- `class_id`: ID lớp học (sẽ cập nhật sau khi tạo)
- `member_id`: ID thành viên
- `assignment_id`: ID assignment
- `invitation_code`: Mã mời lớp học

---

## 1. CLASSES

### 1.1. Tạo lớp học
**Method:** `POST`  
**URL:** `{{base_url}}/api/classes`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```
**Body (JSON):**
```json
{
  "name": "Lớp Toán 10A1",
  "description": "Lớp toán nâng cao khối 10",
  "subject": "Toán học"
}
```

### 1.2. Lấy danh sách lớp
**Method:** `GET`  
**URL:** `{{base_url}}/api/classes?role=TEACHER`  
**Headers:**
```
Authorization: Bearer {{jwt_token}}
```
**Query Params (Optional):**
- `role`: TEACHER hoặc STUDENT

### 1.3. Lấy thông tin lớp
**Method:** `GET`  
**URL:** `{{base_url}}/api/classes/{{class_id}}`  
**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 1.4. Cập nhật lớp
**Method:** `PUT`  
**URL:** `{{base_url}}/api/classes/{{class_id}}`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```
**Body (JSON):**
```json
{
  "name": "Lớp Toán 10A1 - Updated",
  "description": "Mô tả mới",
  "subject": "Toán học",
  "status": "ACTIVE"
}
```

### 1.5. Xóa lớp
**Method:** `DELETE`  
**URL:** `{{base_url}}/api/classes/{{class_id}}`  
**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 1.6. Tạo lại mã mời
**Method:** `POST`  
**URL:** `{{base_url}}/api/classes/{{class_id}}/regenerate-invitation`  
**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 1.7. Tham gia lớp qua mã mời
**Method:** `POST`  
**URL:** `{{base_url}}/api/classes/join?invitationCode={{invitation_code}}`  
**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

---

## 2. CLASS MEMBERS

### 2.1. Thêm thành viên
**Method:** `POST`  
**URL:** `{{base_url}}/api/classes/{{class_id}}/members`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```
**Body (JSON):**
```json
{
  "userId": 4,
  "role": "STUDENT"
}
```

### 2.2. Lấy danh sách thành viên
**Method:** `GET`  
**URL:** `{{base_url}}/api/classes/{{class_id}}/members`  
**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 2.3. Cập nhật vai trò thành viên
**Method:** `PUT`  
**URL:** `{{base_url}}/api/classes/{{class_id}}/members/{{member_id}}/role`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```
**Body (JSON):**
```json
{
  "role": "TEACHER"
}
```

### 2.4. Xóa thành viên
**Method:** `DELETE`  
**URL:** `{{base_url}}/api/classes/{{class_id}}/members/{{member_id}}`  
**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

---

## 3. ASSIGNMENTS

### 3.1. Tạo assignment
**Method:** `POST`  
**URL:** `{{base_url}}/api/assignments`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```
**Body (JSON):**
```json
{
  "classId": 1,
  "quizId": 1,
  "title": "Bài tập tuần 1 - Toán cơ bản",
  "description": "Hoàn thành bài kiểm tra trong tuần này",
  "openTime": "2025-11-25T00:00:00",
  "deadline": "2025-12-01T23:59:59",
  "allowRetake": true,
  "maxAttempts": 3
}
```

### 3.2. Lấy danh sách assignment của lớp
**Method:** `GET`  
**URL:** `{{base_url}}/api/assignments/class/{{class_id}}`  
**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 3.3. Lấy thông tin assignment
**Method:** `GET`  
**URL:** `{{base_url}}/api/assignments/{{assignment_id}}`  
**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 3.4. Bắt đầu làm bài
**Method:** `POST`  
**URL:** `{{base_url}}/api/assignments/{{assignment_id}}/start`  
**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

---

## 4. INVITATIONS

### 4.1. Chấp nhận lời mời
**Method:** `POST`  
**URL:** `{{base_url}}/api/invitations/accept`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```
**Body (JSON):**
```json
{
  "invitationCode": "MATH10A1"
}
```

---

## 5. LEADERBOARD

### 5.1. Lấy bảng xếp hạng
**Method:** `GET`  
**URL:** `{{base_url}}/api/leaderboard/class/{{class_id}}`  
**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

---

## 6. REPORTS

### 6.1. Lấy báo cáo lớp
**Method:** `GET`  
**URL:** `{{base_url}}/api/reports/class/{{class_id}}`  
**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

---

## Test Flow Mẫu

### Flow 1: Teacher tạo lớp và giao bài
1. **Tạo lớp học** (1.1) → Copy `id` → Update variable `class_id`
2. **Thêm thành viên** (2.1) → Thêm học sinh vào lớp
3. **Tạo assignment** (3.1) → Copy `id` → Update variable `assignment_id`
4. **Xem danh sách assignment** (3.2)
5. **Xem báo cáo lớp** (6.1)

### Flow 2: Student tham gia và làm bài
1. **Tham gia lớp** (1.7) hoặc **Chấp nhận lời mời** (4.1)
2. **Xem danh sách lớp** (1.2) với `role=STUDENT`
3. **Xem danh sách assignment** (3.2)
4. **Bắt đầu làm bài** (3.4)
5. **Xem bảng xếp hạng** (5.1)

---

## Lưu ý

1. **JWT Token**: Cần lấy từ Auth Service trước khi test
   ```
   POST http://localhost:8081/api/auth/login
   {
     "email": "teacher1@quiz.com",
     "password": "password123"
   }
   ```

2. **Variables**: Nhớ cập nhật `class_id`, `assignment_id` sau khi tạo mới

3. **Permissions**:
   - Teacher: Có thể thực hiện tất cả operations
   - Student: Chỉ xem và làm bài

4. **Status Codes**:
   - 200: Success
   - 201: Created
   - 400: Bad Request
   - 401: Unauthorized
   - 403: Forbidden
   - 404: Not Found
   - 500: Internal Server Error

---

## Tổng kết

**Tổng cộng: 18 endpoints**
- Classes: 7 endpoints
- Class Members: 4 endpoints
- Assignments: 4 endpoints
- Invitations: 1 endpoint
- Leaderboard: 1 endpoint
- Reports: 1 endpoint

