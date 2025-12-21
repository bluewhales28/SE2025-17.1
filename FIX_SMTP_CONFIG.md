# 🔧 Hướng dẫn Fix SMTP Configuration

## ❌ Vấn đề hiện tại

Từ logs, bạn thấy lỗi:
```
535 5.7.8 Username and Password not accepted
```

**Nguyên nhân:** `SMTP_USER` hoặc `SMTP_PASSWORD` chưa được set hoặc không đúng trong file `.env.production`.

---

## ✅ Cách Fix

### Bước 1: Kiểm tra file `.env.production`

```bash
cd /srv/SE2025-17.1
cat .env.production | grep SMTP
```

**Kết quả mong đợi:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Nếu không có hoặc rỗng:** Cần thêm vào file `.env.production`

---

### Bước 2: Thêm SMTP config vào `.env.production`

Mở file `.env.production` và thêm các dòng sau:

```bash
# SMTP Configuration for Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
```

**Lưu ý quan trọng:**
- `SMTP_USER`: Email Gmail của bạn (ví dụ: `yourname@gmail.com`)
- `SMTP_PASSWORD`: **KHÔNG phải mật khẩu Gmail thông thường**, mà phải là **App Password**

---

### Bước 3: Tạo Gmail App Password

Gmail không cho phép dùng mật khẩu thông thường cho SMTP. Bạn cần tạo **App Password**:

1. **Bật 2-Step Verification:**
   - Vào https://myaccount.google.com/security
   - Bật "2-Step Verification" nếu chưa bật

2. **Tạo App Password:**
   - Vào https://myaccount.google.com/apppasswords
   - Chọn "Mail" và "Other (Custom name)"
   - Nhập tên: "Quiz App Notification"
   - Click "Generate"
   - Copy password được tạo (16 ký tự, không có khoảng trắng)

3. **Cập nhật `.env.production`:**
   ```bash
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # Dán App Password (bỏ khoảng trắng)
   ```

---

### Bước 4: Restart notification-service

Sau khi cập nhật `.env.production`:

```bash
cd /srv/SE2025-17.1
docker compose -f docker-compose.prod.yml restart notification-service
```

Hoặc rebuild nếu cần:

```bash
docker compose -f docker-compose.prod.yml up -d --build notification-service
```

---

### Bước 5: Kiểm tra lại

```bash
# Kiểm tra SMTP config trong container
docker exec notification-service env | grep SMTP

# Kiểm tra logs
docker logs notification-service --tail 20 | grep SMTP
```

**Kết quả mong đợi:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx... (có giá trị)
```

---

### Bước 6: Test lại

1. Đăng ký user mới hoặc request password reset
2. Kiểm tra logs:
   ```bash
   docker logs notification-service --tail 30 | grep -i "email\|smtp"
   ```
3. Kiểm tra notifications trong database:
   ```bash
   docker exec -it postgres psql -U postgres -d quizz -c "SELECT id, type, status FROM notifications ORDER BY created_at DESC LIMIT 5;"
   ```

**Kết quả mong đợi:**
- Logs không còn lỗi `535 5.7.8 Username and Password not accepted`
- Notification có `status='sent'` thay vì `status='failed'`

---

## 🔍 Troubleshooting

### Nếu vẫn lỗi "Username and Password not accepted":

1. **Kiểm tra App Password:**
   - Đảm bảo đã bật 2-Step Verification
   - Đảm bảo App Password được copy đúng (16 ký tự, không có khoảng trắng)

2. **Kiểm tra "Less secure app access":**
   - Gmail đã tắt tính năng này, nên **bắt buộc** phải dùng App Password

3. **Kiểm tra format trong `.env.production`:**
   ```bash
   # ✅ ĐÚNG
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=abcdefghijklmnop
   
   # ❌ SAI (có khoảng trắng)
   SMTP_PASSWORD=abcd efgh ijkl mnop
   
   # ❌ SAI (có quotes)
   SMTP_USER="your-email@gmail.com"
   ```

4. **Kiểm tra container đã load env chưa:**
   ```bash
   docker exec notification-service env | grep SMTP_USER
   ```
   Nếu rỗng → container chưa restart sau khi update `.env.production`

---

## 📝 Ví dụ file `.env.production` hoàn chỉnh

```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
DB_NAME=quizz

# JWT
JWT_SECRET=your-secret-key-here

# Frontend URL
FRONTEND_URL=http://34.124.178.144

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
```

---

## 🚨 Lưu ý bảo mật

- **KHÔNG commit file `.env.production` lên Git**
- **KHÔNG share App Password** với người khác
- Nếu dùng email khác (không phải Gmail), cần điều chỉnh `SMTP_HOST` và `SMTP_PORT` tương ứng

