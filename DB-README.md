Dưới đây là **README** mô tả đầy đủ cấu trúc **Database hệ thống Quiz Platform**, giải thích **mối quan hệ giữa các bảng**, **chức năng từng phần** và **luồng dữ liệu nội bộ**, **chỉ dựa trên DB** mà không thêm gợi ý kỹ thuật khác.

---

# 🧠 QUIZ PLATFORM – DATABASE STRUCTURE README

## 🏗️ 1. Tổng quan

Hệ thống được thiết kế theo mô hình **multi-module quiz platform**, với các thành phần chính:

* **Người dùng & xác thực (users, invalid_tokens)**
* **Quản lý quiz & câu hỏi (quizzes, questions)**
* **Lượt làm bài & lưu kết quả (attempts, attempt_answers)**
* **Lớp học & bài tập (classes, class_members, assignments, student_progress)**
* **Báo cáo, thống kê, cảnh báo (reports, analytics_cache, alerts)**
* **Thông báo & email (notifications, email_templates)**

Tất cả đều được liên kết bằng **khóa ngoại rõ ràng**, đảm bảo tính toàn vẹn dữ liệu.

---

## 🧍‍♂️ 2. Người dùng & Xác thực

### `users`

* Lưu thông tin tài khoản: email, mật khẩu, họ tên, giới tính, vai trò, trạng thái xác minh.
* Trường `role` xác định quyền hạn (USER, ADMIN). USER kế thừa toàn bộ quyền tạo/làm quiz từng gán cho TEACHER trước đây.
* Mỗi user có thể là **người tạo quiz**, **giáo viên trong lớp** (theo `class_role_enum`), hoặc **học sinh**.

### `invalid_tokens`

* Lưu các **JWT token bị thu hồi** (khi logout, đổi mật khẩu, v.v.).
* Dùng để xác minh token hợp lệ khi xác thực.

**Quan hệ:**

* Không liên kết trực tiếp, nhưng ràng buộc logic với user trong tầng ứng dụng.

---

## 🧩 3. Quiz & Câu hỏi

### `quizzes`

* Đại diện cho **một bài kiểm tra / bộ câu hỏi**.
* Gắn với **người tạo (creator_id → users.id)**.
* Bao gồm thông tin: tiêu đề, mô tả, độ khó, thẻ tag, chế độ hiển thị (PUBLIC/PRIVATE), thời lượng, số lượt làm tối đa.

### `questions`

* Danh sách **câu hỏi thuộc quiz**.
* Gắn với `quiz_id` → `quizzes.id`.
* Mỗi câu hỏi có:

  * `type`: MULTIPLE_CHOICE / TRUE_FALSE / ESSAY
  * `options`: lưu dưới dạng JSONB
  * `correct_answer`: JSONB (cho MCQ hoặc TRUE_FALSE)
  * `score`: điểm của câu hỏi

**Quan hệ:**

* `quizzes` (1) --- (n) `questions`
  → Khi quiz bị xóa, toàn bộ câu hỏi bị xóa theo (`ON DELETE CASCADE`).

---

## 🧮 4. Lượt làm quiz & câu trả lời

### `attempts`

* Lưu **mỗi lượt người dùng làm quiz**.
* Gắn với `user_id` → `users.id`, `quiz_id` → `quizzes.id`.
* Ghi nhận thời gian bắt đầu, kết thúc, điểm, trạng thái nộp, seed trộn câu hỏi.

### `attempt_answers`

* Lưu **các câu trả lời** của từng câu hỏi trong một lượt làm.
* Gắn với `attempt_id` → `attempts.id` và `question_id` → `questions.id`.
* `answer` và `is_correct` lưu dưới dạng JSONB để linh hoạt nhiều loại câu hỏi.

**Quan hệ:**

* `attempts` (1) --- (n) `attempt_answers`
* `users` (1) --- (n) `attempts`
* `quizzes` (1) --- (n) `attempts`

---

## 🏫 5. Lớp học & Thành viên

### `classes`

* Đại diện cho **một lớp học trực tuyến**.
* Mỗi lớp có `teacher_id` (giáo viên chủ nhiệm → `users.id`)
* Có mã mời (`invitation_code`) để học sinh tham gia.

### `class_members`

* Lưu **thành viên của lớp** (giáo viên, học sinh, trợ giảng).
* Gắn với `class_id` và `user_id`.
* Tránh trùng lặp qua `UNIQUE (class_id, user_id)`.

**Quan hệ:**

* `classes` (1) --- (n) `class_members`
* `users` (1) --- (n) `class_members`
* Một user có thể thuộc nhiều lớp, một lớp có nhiều user.

---

## 📘 6. Bài tập & Tiến độ học sinh

### `assignments`

* Đại diện **một bài tập hoặc quiz được giao trong lớp**.
* Gắn với `class_id` → `classes.id` và `quiz_id` → `quizzes.id`.
* Có thời gian bắt đầu (`start_time`), hạn nộp (`due_time`), và điểm tối đa (`max_score`).

### `student_progress`

* Ghi lại **trạng thái tiến độ của từng học sinh cho mỗi bài tập**.
* `status`: NOT_STARTED / IN_PROGRESS / COMPLETED
* Gắn với `assignment_id` và `student_id`.
* Có `UNIQUE (assignment_id, student_id)` để tránh trùng.

**Quan hệ:**

* `assignments` (1) --- (n) `student_progress`
* `users` (1) --- (n) `student_progress`

---

## 📊 7. Báo cáo & Thống kê

### `reports`

* Lưu trữ **các báo cáo hoặc file tổng hợp (PDF, thống kê điểm, v.v.)**.
* `report_type` xác định loại (ví dụ: quiz_report, class_summary).
* `reference_id` liên kết đến ID của thực thể được báo cáo (quiz, class, user,…).
* `metadata` chứa dữ liệu phụ (JSONB).

### `analytics_cache`

* Lưu **kết quả phân tích được cache**, tránh tính toán lại thường xuyên.
* Key-value (ví dụ: `key='quiz:1:stats'`).

### `alerts`

* Lưu các **cảnh báo hệ thống hoặc người dùng**.
* `type`, `severity`, `metadata` cho phép ghi chi tiết.

---

## ✉️ 8. Thông báo & Gửi email

### `notifications`

* Mỗi bản ghi là **một thông báo gửi qua email**.
* Gắn với `user_id` → `users.id`.
* Bao gồm thông tin: loại thông báo, tiêu đề, nội dung, số lần thử gửi, lỗi nếu có.
* Sau khi gửi thành công → cập nhật `is_sent = TRUE` và `sent_at`.

### `email_templates`

* Lưu **mẫu email HTML** có biến động (`variables`) để sinh nội dung động.
* Mỗi template có `type`, `subject`, `body_html`, `body_text`.

**Luồng xử lý trong DB (theo RabbitMQ cơ sở dữ liệu):**

1. Một thông báo mới được tạo → INSERT vào `notifications`.
2. Thông tin được đẩy sang hàng đợi (queue) để worker xử lý.
3. Sau khi worker gửi email, hệ thống cập nhật lại dòng tương ứng trong `notifications`:

   * `is_sent`, `sent_at`, `error_message`, `attempts`.

---

## 🧾 9. Quan hệ tổng quát

| Bảng        | Liên kết chính                 | Mối quan hệ |
| ----------- | ------------------------------ | ----------- |
| users       | quizzes.creator_id             | 1 → n       |
| users       | attempts.user_id               | 1 → n       |
| quizzes     | questions.quiz_id              | 1 → n       |
| quizzes     | attempts.quiz_id               | 1 → n       |
| attempts    | attempt_answers.attempt_id     | 1 → n       |
| users       | classes.teacher_id             | 1 → n       |
| classes     | class_members.class_id         | 1 → n       |
| users       | class_members.user_id          | 1 → n       |
| classes     | assignments.class_id           | 1 → n       |
| quizzes     | assignments.quiz_id            | 1 → n       |
| assignments | student_progress.assignment_id | 1 → n       |
| users       | student_progress.student_id    | 1 → n       |
| users       | notifications.user_id          | 1 → n       |

---

## 🔄 10. Tóm tắt luồng dữ liệu chính

### 🧭 Luồng học tập

1. Giáo viên tạo **quiz** → lưu trong `quizzes`.
2. Thêm câu hỏi vào `questions`.
3. Giao quiz cho lớp → tạo `assignments`.
4. Học sinh làm bài → ghi vào `attempts` và `attempt_answers`.
5. Kết quả cập nhật trong `student_progress`.
6. Báo cáo và thống kê lưu trong `reports` / `analytics_cache`.

### 📬 Luồng thông báo

1. Sự kiện phát sinh → thêm bản ghi vào `notifications`.
2. Worker đọc và gửi email (theo `email_templates`).
3. Cập nhật trạng thái gửi (`is_sent`, `error_message`, …).

