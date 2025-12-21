# 🔍 Hướng dẫn Debug Email Notification

## Bước 1: Kiểm tra User đã được tạo thành công

```bash
# Kiểm tra user vừa đăng ký có trong database không
docker exec -it postgres psql -U postgres -d quizz -c "SELECT id, email, full_name, created_at FROM users ORDER BY created_at DESC LIMIT 5;"
```

**Kết quả mong đợi:** User mới xuất hiện trong danh sách

---

## Bước 2: Kiểm tra logs của user-auth-service (xem có publish event không)

```bash
# Xem logs của user-auth-service
docker logs user-auth-service --tail 100 | grep -i "email\|rabbit\|welcome"

# Hoặc xem toàn bộ logs gần đây
docker logs user-auth-service --tail 50
```

**Tìm các dòng:**
- `"Sending welcome email to new user: ..."`
- `"Welcome email event published for user: ..."`
- `"Publishing email event to exchange=..."`
- `"RabbitMQ publish confirmed"` hoặc `"RabbitMQ publish NOT confirmed"`

**Nếu thấy lỗi:**
- `"Failed to send welcome email"` → Có lỗi khi publish event
- `"RabbitMQ publish NOT confirmed"` → RabbitMQ không nhận được message

---

## Bước 3: Kiểm tra RabbitMQ đang chạy

```bash
# Kiểm tra RabbitMQ container
docker ps | grep rabbitmq

# Kiểm tra logs của RabbitMQ
docker logs rabbitmq --tail 50

# Kiểm tra RabbitMQ Management UI (nếu có)
# Truy cập: http://34.124.178.144:15672 (guest/guest)
```

**Kết quả mong đợi:** RabbitMQ container đang chạy

---

## Bước 4: Kiểm tra logs của notification-service (xem có nhận event không)

```bash
# Xem logs của notification-service
docker logs notification-service --tail 100 | grep -i "event\|rabbit\|email\|notification"

# Hoặc xem toàn bộ logs
docker logs notification-service --tail 50
```

**Tìm các dòng:**
- `"Successfully connected to RabbitMQ"`
- `"Starting to listen for RabbitMQ events..."`
- `"Received event: type=..."`
- `"Notification created: ID=..."`
- `"[Email] Processing notification..."`

**Nếu thấy lỗi:**
- `"Failed to connect to RabbitMQ"` → Không kết nối được RabbitMQ
- `"Failed to create notification"` → Lỗi khi lưu vào database

---

## Bước 5: Kiểm tra notifications trong database

```bash
# Kiểm tra notifications đã được tạo
docker exec -it postgres psql -U postgres -d quizz -c "SELECT id, type, status, channel, created_at FROM notifications ORDER BY created_at DESC LIMIT 10;"

# Kiểm tra chi tiết notification
docker exec -it postgres psql -U postgres -d quizz -c "SELECT id, type, status, channel, metadata FROM notifications ORDER BY created_at DESC LIMIT 1;"
```

**Kết quả mong đợi:** Có notification với `type='user_registered'` và `status='pending'` hoặc `'sent'`

---

## Bước 6: Kiểm tra SMTP Configuration

```bash
# Kiểm tra SMTP config trong notification-service container
docker exec notification-service env | grep SMTP

# Hoặc kiểm tra trong docker-compose
cat docker-compose.prod.yml | grep SMTP
```

**Cần có:**
- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587`
- `SMTP_USER=...` (email của bạn)
- `SMTP_PASSWORD=...` (App Password của Gmail)

---

## Bước 7: Kiểm tra email templates

```bash
# Kiểm tra template "user_registered" có tồn tại không
docker exec -it postgres psql -U postgres -d quizz -c "SELECT id, name, subject FROM email_templates WHERE name = 'user_registered';"
```

**Kết quả mong đợi:** Có template với `name='user_registered'`

---

## Bước 8: Test trực tiếp RabbitMQ connection

```bash
# Vào RabbitMQ Management UI
# URL: http://34.124.178.144:15672
# Login: guest / guest

# Hoặc kiểm tra queue qua command line
docker exec rabbitmq rabbitmqctl list_queues
docker exec rabbitmq rabbitmqctl list_exchanges
```

---

## Bước 9: Test gửi email trực tiếp (nếu cần)

```bash
# Vào notification-service container và test
docker exec -it notification-service sh

# Trong container, có thể test gửi email (nếu có tool)
```

---

## 📋 Checklist Debug

- [ ] User đã được tạo trong database
- [ ] user-auth-service có log "Welcome email event published"
- [ ] RabbitMQ container đang chạy
- [ ] notification-service có log "Successfully connected to RabbitMQ"
- [ ] notification-service có log "Received event"
- [ ] Notification đã được tạo trong database
- [ ] SMTP config đã được set đúng
- [ ] Email template "user_registered" tồn tại

---

## 🐛 Các lỗi thường gặp và cách fix

### 1. RabbitMQ connection refused
**Nguyên nhân:** RabbitMQ chưa sẵn sàng khi notification-service khởi động
**Fix:** Đã thêm retry logic, nhưng cần đảm bảo RabbitMQ start trước

### 2. Notification created nhưng status = "failed"
**Nguyên nhân:** SMTP config sai hoặc template không tìm thấy
**Fix:** Kiểm tra SMTP config và email templates

### 3. Không có notification nào được tạo
**Nguyên nhân:** RabbitMQ consumer không nhận được event
**Fix:** Kiểm tra routing key và exchange binding

### 4. Email không được gửi
**Nguyên nhân:** SMTP config sai hoặc Gmail App Password không đúng
**Fix:** Kiểm tra lại SMTP_USER và SMTP_PASSWORD

