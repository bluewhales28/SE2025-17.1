# 🚀 Hướng dẫn Deploy lên Server Production

Server: **longvq@20.6.128.179**

## 📋 Yêu cầu trên Server

### 1. Cài đặt Docker & Docker Compose
```bash
# Kết nối SSH vào server
ssh longvq@20.6.128.179

# Cài Docker
sudo apt update
sudo apt install -y docker.io docker-compose

# Thêm user vào docker group (không cần sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker-compose --version
```

### 2. Cài đặt Git
```bash
sudo apt install -y git
```

### 3. Mở ports cần thiết
```bash
# Firewall rules (nếu có)
sudo ufw allow 80/tcp
sudo ufw allow 5672/tcp
sudo ufw allow 15672/tcp
```

## 🎯 Cách Deploy

### Phương án 1: Tự động (Khuyến nghị)

**Từ máy local:**
```bash
# Cấp quyền thực thi
chmod +x deploy.sh

# Chạy script deploy
./deploy.sh
```

Script sẽ tự động:
- Pull code mới nhất
- Copy files lên server
- Setup .env từ .env.production
- Build và start tất cả services

### Phương án 2: Thủ công

**Bước 1: Trên máy local - Push code lên Git**
```bash
git add .
git commit -m "Update for production deployment"
git push origin main
```

**Bước 2: Trên server - Clone hoặc pull code**
```bash
# Lần đầu tiên
ssh longvq@20.6.128.179
git clone <your-repo-url> SE2025-17.1
cd SE2025-17.1

# Các lần sau
cd SE2025-17.1
git pull origin main
```

**Bước 3: Setup .env**
```bash
# Copy production env
cp .env.production .env

# Hoặc tạo .env mới
nano .env
```

Nội dung .env:
```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
DB_NAME=quizz
JWT_SECRET=5020f057d0d31c44d2397a3265c89b86b95a1903160610e290786cfe36e43e7b
FRONTEND_URL=http://20.6.128.179
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=luntanson@gmail.com
SMTP_PASSWORD=rfca yvny tdab drdv
SMTP_FROM_EMAIL=luntanson@gmail.com
SMTP_FROM_NAME=Quiz App
```

**Bước 4: Build và chạy**
```bash
# Build lần đầu
docker-compose -f docker-compose.prod.yml up -d --build

# Các lần sau (nếu không đổi code)
docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 Kiểm tra trạng thái

```bash
# Xem containers đang chạy
docker-compose -f docker-compose.prod.yml ps

# Xem logs
docker-compose -f docker-compose.prod.yml logs -f

# Xem logs của 1 service cụ thể
docker-compose -f docker-compose.prod.yml logs -f user-auth-service
docker-compose -f docker-compose.prod.yml logs -f notification-service
```

## 🌐 Truy cập ứng dụng

- **Frontend**: http://20.6.128.179
- **API Gateway**: http://20.6.128.179/api/v1
- **RabbitMQ Management**: http://20.6.128.179:15672 (guest/guest)

### Test API

```bash
# Test health check
curl http://20.6.128.179/api/v1/auth/health

# Test login
curl -X POST http://20.6.128.179/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@example.com","password":"teacher123"}'
```

## 🔄 Update code mới

```bash
# Trên server
cd SE2025-17.1
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🛑 Dừng services

```bash
# Dừng tất cả
docker-compose -f docker-compose.prod.yml down

# Dừng và xóa volumes (MẤT DATA!)
docker-compose -f docker-compose.prod.yml down -v

# Restart 1 service cụ thể
docker-compose -f docker-compose.prod.yml restart user-auth-service
```

## 📊 Monitoring

### Xem resource usage
```bash
docker stats
```

### Xem disk usage
```bash
docker system df
```

### Clean up
```bash
# Xóa images không dùng
docker image prune -a

# Xóa containers stopped
docker container prune

# Xóa volumes không dùng
docker volume prune
```

## 🐛 Troubleshooting

### 1. Port đã được sử dụng
```bash
# Kiểm tra process đang dùng port 80
sudo lsof -i :80
sudo kill -9 <PID>
```

### 2. Container không start
```bash
# Xem logs chi tiết
docker-compose -f docker-compose.prod.yml logs <service-name>

# Rebuild từ đầu
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build --force-recreate
```

### 3. Database connection error
```bash
# Kiểm tra postgres
docker-compose -f docker-compose.prod.yml exec postgres pg_isready

# Restart database
docker-compose -f docker-compose.prod.yml restart postgres
```

### 4. Email không gửi được
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs notification-service

# Verify SMTP config trong .env
cat .env | grep SMTP
```

### 5. CORS error từ browser
- Nginx đã config CORS cho IP 20.6.128.179
- Nếu vẫn lỗi, kiểm tra:
```bash
# Xem nginx config
docker-compose -f docker-compose.prod.yml exec nginx cat /etc/nginx/nginx.conf | grep -A5 "map.*allow_origin"

# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

## 📦 Cấu hình đã được setup

✅ **Nginx**: 
- CORS cho IP 20.6.128.179
- Reverse proxy cho 4 services
- Port 80 exposed

✅ **Services**:
- Frontend (Next.js)
- User Auth Service (Spring Boot)
- Quiz Service (Go)
- Notification Service (Go + Email)

✅ **Infrastructure**:
- PostgreSQL database
- Redis cache
- RabbitMQ message queue

## 🔒 Bảo mật

### Thay đổi credentials mặc định:

1. **JWT_SECRET**: Generate key mới
```bash
openssl rand -hex 32
```

2. **Database password**: 
```bash
# Trong .env
POSTGRES_PASSWORD=<strong-password-here>
```

3. **RabbitMQ credentials**:
Sửa trong docker-compose.prod.yml:
```yaml
rabbitmq:
  environment:
    RABBITMQ_DEFAULT_USER: admin
    RABBITMQ_DEFAULT_PASS: <strong-password>
```

## 📞 Support

Nếu gặp vấn đề, kiểm tra logs:
```bash
docker-compose -f docker-compose.prod.yml logs --tail=100 -f
```

Hoặc check từng service:
- Frontend
- User Auth Service
- Quiz Service  
- Notification Service
- PostgreSQL
- RabbitMQ
- Redis
- Nginx
