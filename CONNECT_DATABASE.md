# 🔌 Hướng dẫn Connect Database từ máy khác

## 📋 Thông tin Database trên Server

- **Server IP:** `34.124.178.144`
- **Port:** `5432`
- **Database Name:** `quizz`
- **Username:** `postgres` (hoặc từ file `.env`)
- **Password:** `password` (hoặc từ file `.env`)

---

## 🔧 Cách 1: Dùng psql (Command Line)

### Trên Windows (PowerShell/CMD):

```bash
# Cài đặt PostgreSQL client nếu chưa có
# Download từ: https://www.postgresql.org/download/windows/

# Connect
psql -h 34.124.178.144 -p 5432 -U postgres -d quizz
```

### Trên Linux/Mac:

```bash
# Cài đặt PostgreSQL client nếu chưa có
# Ubuntu/Debian:
sudo apt-get install postgresql-client

# Mac:
brew install postgresql

# Connect
psql -h 34.124.178.144 -p 5432 -U postgres -d quizz
```

**Khi được hỏi password, nhập:** `password` (hoặc password từ file `.env` trên server)

---

## 🖥️ Cách 2: Dùng GUI Tools

### DBeaver (Miễn phí, đa nền tảng)

1. **Download:** https://dbeaver.io/download/
2. **Tạo connection mới:**
   - Click "New Database Connection"
   - Chọn "PostgreSQL"
   - **Host:** `34.124.178.144`
   - **Port:** `5432`
   - **Database:** `quizz`
   - **Username:** `postgres`
   - **Password:** `password`
   - Click "Test Connection"
   - Click "Finish"

### pgAdmin (Official PostgreSQL Tool)

1. **Download:** https://www.pgadmin.org/download/
2. **Tạo server mới:**
   - Right-click "Servers" → "Create" → "Server"
   - **General tab:**
     - Name: `SE2025-17 Server`
   - **Connection tab:**
     - Host: `34.124.178.144`
     - Port: `5432`
     - Database: `quizz`
     - Username: `postgres`
     - Password: `password`
   - Click "Save"

### TablePlus (Mac/Windows, có bản miễn phí)

1. **Download:** https://tableplus.com/
2. **Tạo connection:**
   - Click "Create a new connection"
   - Chọn "PostgreSQL"
   - **Host:** `34.124.178.144`
   - **Port:** `5432`
   - **Database:** `quizz`
   - **User:** `postgres`
   - **Password:** `password`
   - Click "Test" → "Connect"

---

## 🔐 Cách 3: Dùng Connection String

### JDBC (Java/Spring Boot):

```
jdbc:postgresql://34.124.178.144:5432/quizz?user=postgres&password=password
```

### Go (GORM):

```go
dsn := "host=34.124.178.144 port=5432 user=postgres password=password dbname=quizz sslmode=disable"
```

### Python (psycopg2):

```python
import psycopg2

conn = psycopg2.connect(
    host="34.124.178.144",
    port=5432,
    database="quizz",
    user="postgres",
    password="password"
)
```

### Node.js (pg):

```javascript
const { Client } = require('pg');

const client = new Client({
  host: '34.124.178.144',
  port: 5432,
  database: 'quizz',
  user: 'postgres',
  password: 'password'
});
```

---

## ⚠️ Lưu ý bảo mật

### 1. Firewall trên Server

Đảm bảo port 5432 đã được mở trên server:

```bash
# Kiểm tra firewall
sudo ufw status

# Nếu cần mở port (Ubuntu/Debian)
sudo ufw allow 5432/tcp
```

### 2. PostgreSQL Configuration

Trên server, cần cấu hình PostgreSQL cho phép remote connection:

**File:** `/var/lib/docker/volumes/.../postgresql.conf` (trong container)

Hoặc chỉnh sửa trong container:

```bash
# Vào container postgres
docker exec -it postgres sh

# Chỉnh sửa postgresql.conf
# Tìm và sửa:
# listen_addresses = '*'  (thay vì 'localhost')

# Chỉnh sửa pg_hba.conf
# Thêm dòng:
# host    all    all    0.0.0.0/0    md5
```

**Hoặc đơn giản hơn, restart container với network mode host:**

```yaml
# Trong docker-compose.prod.yml, thêm:
postgres:
  network_mode: "host"  # Cho phép access từ bên ngoài
```

### 3. Kiểm tra kết nối từ server

Trên server, test xem port đã mở chưa:

```bash
# Kiểm tra port đang listen
sudo netstat -tlnp | grep 5432
# hoặc
sudo ss -tlnp | grep 5432

# Test từ localhost
psql -h localhost -p 5432 -U postgres -d quizz
```

---

## 🧪 Test Connection

### Từ máy khác, test kết nối:

```bash
# Test với telnet (nếu có)
telnet 34.124.178.144 5432

# Hoặc với nc (netcat)
nc -zv 34.124.178.144 5432

# Test với psql
psql -h 34.124.178.144 -p 5432 -U postgres -d quizz -c "SELECT version();"
```

---

## 📝 Các lệnh SQL hữu ích

Sau khi connect, bạn có thể chạy:

```sql
-- Xem tất cả databases
\l

-- Xem tất cả tables
\dt

-- Xem tất cả tables trong schema public
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Xem users
SELECT * FROM users LIMIT 10;

-- Xem notifications
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;

-- Xem quizzes
SELECT * FROM quizzes LIMIT 10;
```

---

## 🚨 Troubleshooting

### Lỗi: "Connection refused"

**Nguyên nhân:** Port chưa được mở hoặc PostgreSQL không listen trên external interface

**Fix:**
1. Kiểm tra firewall trên server
2. Kiểm tra PostgreSQL config (listen_addresses)
3. Kiểm tra docker port mapping

### Lỗi: "Password authentication failed"

**Nguyên nhân:** Sai username/password

**Fix:**
- Kiểm tra lại username/password trong file `.env` trên server
- Hoặc reset password trong container:
  ```bash
  docker exec -it postgres psql -U postgres
  ALTER USER postgres WITH PASSWORD 'newpassword';
  ```

### Lỗi: "Database does not exist"

**Nguyên nhân:** Database name sai

**Fix:**
- Kiểm tra database name trong file `.env` trên server (thường là `quizz`)
- List databases: `\l` trong psql

