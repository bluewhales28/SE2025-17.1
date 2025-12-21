# 🔧 Fix: Docker Compose không load .env.production

## ❌ Vấn đề

Docker Compose **chỉ tự động load file `.env`** (không có `.production`).

Khi bạn có file `.env.production`, Docker Compose sẽ không đọc nó, dẫn đến:
```
WARN[0000] The "SMTP_USER" variable is not set. Defaulting to a blank string.
WARN[0000] The "SMTP_PASSWORD" variable is not set. Defaulting to a blank string.
```

---

## ✅ Giải pháp

### Cách 1: Đổi tên file `.env.production` thành `.env` (Khuyến nghị)

**Trên server, chạy:**

```bash
cd /srv/SE2025-17.1

# Backup file cũ nếu có
if [ -f .env ]; then
    cp .env .env.backup
fi

# Copy .env.production thành .env
cp .env.production .env

# Kiểm tra lại
cat .env | grep SMTP
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

**Sau đó restart:**
```bash
docker compose -f docker-compose.prod.yml restart notification-service
```

**Kiểm tra lại:**
```bash
docker exec notification-service env | grep SMTP
```

---

### Cách 2: Dùng flag `--env-file` (Nếu muốn giữ tên `.env.production`)

**Khi chạy docker compose, thêm flag:**

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production restart notification-service
```

**Hoặc khi up:**
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

**⚠️ Lưu ý:** Phải nhớ thêm `--env-file .env.production` mỗi lần chạy lệnh docker compose.

---

## 📝 Checklist

- [ ] File `.env` tồn tại trong `/srv/SE2025-17.1/`
- [ ] File `.env` có đầy đủ SMTP config
- [ ] `SMTP_PASSWORD` không có khoảng trắng
- [ ] Container notification-service đã restart
- [ ] Environment variables đã được load (check bằng `docker exec notification-service env | grep SMTP`)

---

## 🚨 Lưu ý bảo mật

- File `.env` chứa sensitive data, **KHÔNG commit lên Git**
- Đảm bảo file `.env` có quyền phù hợp: `chmod 600 .env`
- Backup file `.env` trước khi thay đổi

