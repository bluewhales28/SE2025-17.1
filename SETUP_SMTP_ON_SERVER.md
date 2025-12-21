# 📧 Hướng dẫn Setup SMTP trên Server

## ✅ Thông tin SMTP của bạn

Từ file `.env.production`, bạn đã có:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=luntanson@gmail.com
SMTP_PASSWORD=rfca yvny tdab drdv  ← Cần bỏ khoảng trắng!
SMTP_FROM_EMAIL=luntanson@gmail.com
SMTP_FROM_NAME=Quiz App
```

---

## 🔧 Các bước setup trên server

### Bước 1: SSH vào server

```bash
ssh long@se2025-17
cd /srv/SE2025-17.1
```

### Bước 2: Kiểm tra file `.env.production`

```bash
cat .env.production | grep SMTP
```

**Nếu chưa có hoặc thiếu:** Cần thêm vào

### Bước 3: Sửa file `.env.production`

```bash
nano .env.production
# hoặc
vi .env.production
```

**Thêm hoặc sửa các dòng sau:**

```bash
# Email Configuration (SMTP - Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=luntanson@gmail.com
SMTP_PASSWORD=rfcayvnytdabdrdv
SMTP_FROM_EMAIL=luntanson@gmail.com
SMTP_FROM_NAME=Quiz App
```

**⚠️ QUAN TRỌNG:**
- `SMTP_PASSWORD` phải **BỎ KHOẢNG TRẮNG**: `rfcayvnytdabdrdv` (không phải `rfca yvny tdab drdv`)
- Không có dấu ngoặc kép, không có khoảng trắng ở đầu/cuối

### Bước 4: Lưu file và kiểm tra lại

```bash
# Kiểm tra lại
cat .env.production | grep SMTP
```

**Kết quả mong đợi:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=luntanson@gmail.com
SMTP_PASSWORD=rfcayvnytdabdrdv
SMTP_FROM_EMAIL=luntanson@gmail.com
SMTP_FROM_NAME=Quiz App
```

### Bước 5: Restart notification-service

```bash
docker compose -f docker-compose.prod.yml restart notification-service
```

**Hoặc rebuild nếu cần:**
```bash
docker compose -f docker-compose.prod.yml up -d --build notification-service
```

### Bước 6: Kiểm tra SMTP config đã được load

```bash
# Kiểm tra environment variables trong container
docker exec notification-service env | grep SMTP
```

**Kết quả mong đợi:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=luntanson@gmail.com
SMTP_PASSWORD=rfcayvnytdabdrdv
SMTP_FROM_EMAIL=luntanson@gmail.com
SMTP_FROM_NAME=Quiz App
```

**Nếu `SMTP_PASSWORD` rỗng hoặc có khoảng trắng:** Container chưa restart hoặc file `.env.production` chưa đúng

### Bước 7: Kiểm tra logs

```bash
docker logs notification-service --tail 30 | grep -i "smtp\|email"
```

**Tìm các dòng:**
- `[SMTP] Connecting to smtp.gmail.com:587 with user luntanson@gmail.com` ← Phải có username
- Không còn lỗi `535 5.7.8 Username and Password not accepted`

### Bước 8: Test gửi email

1. **Đăng ký user mới** hoặc **Request password reset**
2. **Kiểm tra logs:**
   ```bash
   docker logs notification-service --tail 20
   ```
3. **Kiểm tra notifications:**
   ```bash
   docker exec -it postgres psql -U postgres -d quizz -c "SELECT id, type, status, created_at FROM notifications ORDER BY created_at DESC LIMIT 5;"
   ```

**Kết quả mong đợi:**
- Notification có `status='sent'` thay vì `status='failed'`
- Logs không còn lỗi authentication

---

## 🚨 Troubleshooting

### Nếu vẫn lỗi "Username and Password not accepted":

1. **Kiểm tra App Password:**
   - Đảm bảo đã bật 2-Step Verification trên Gmail
   - Đảm bảo App Password được tạo đúng tại: https://myaccount.google.com/apppasswords
   - Copy lại App Password mới nếu cần

2. **Kiểm tra format trong `.env.production`:**
   ```bash
   # ✅ ĐÚNG
   SMTP_PASSWORD=rfcayvnytdabdrdv
   
   # ❌ SAI (có khoảng trắng)
   SMTP_PASSWORD=rfca yvny tdab drdv
   
   # ❌ SAI (có quotes)
   SMTP_PASSWORD="rfcayvnytdabdrdv"
   ```

3. **Kiểm tra container đã load env:**
   ```bash
   docker exec notification-service env | grep SMTP_PASSWORD
   ```
   Nếu rỗng → container chưa restart sau khi update `.env.production`

4. **Kiểm tra file `.env.production` có được load:**
   - Docker Compose tự động load file `.env.production` nếu nó ở cùng thư mục với `docker-compose.prod.yml`
   - Đảm bảo file `.env.production` nằm trong `/srv/SE2025-17.1/`

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

# Email Configuration (SMTP - Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=luntanson@gmail.com
SMTP_PASSWORD=rfcayvnytdabdrdv
SMTP_FROM_EMAIL=luntanson@gmail.com
SMTP_FROM_NAME=Quiz App
```

---

## ✅ Checklist

- [ ] File `.env.production` có đầy đủ SMTP config
- [ ] `SMTP_PASSWORD` không có khoảng trắng
- [ ] Container notification-service đã restart
- [ ] Environment variables đã được load vào container
- [ ] Logs không còn lỗi authentication
- [ ] Test gửi email thành công

