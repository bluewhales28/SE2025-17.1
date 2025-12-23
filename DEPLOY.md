# 🚀 Hướng dẫn Deploy - Quiz Application

## 📋 Mục lục
1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Các file cần thiết](#các-file-cần-thiết)
3. [Chuẩn bị môi trường](#chuẩn-bị-môi-trường)
4. [Deploy trên Server](#deploy-trên-server)
5. [Kiểm tra sau khi deploy](#kiểm-tra-sau-khi-deploy)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Yêu cầu hệ thống

### Server Requirements
- **OS:** Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM:** Tối thiểu 2GB (khuyến nghị 4GB+)
- **CPU:** Tối thiểu 2 cores
- **Disk:** Tối thiểu 20GB free space
- **Network:** Port 80, 443 (nếu dùng HTTPS), 5432, 6379, 5672, 15672 phải mở

### Software Requirements
- **Docker:** Version 20.10+
- **Docker Compose:** Version 2.0+
- **Git:** Version 2.0+

### Kiểm tra cài đặt
```bash
# Kiểm tra Docker
docker --version
docker compose version

# Kiểm tra Git
git --version

# Kiểm tra disk space
df -h

# Kiểm tra RAM
free -h
```

---

## 📁 Các file cần thiết

### 1. File cấu hình chính
```
SE2025-17.1/
├── docker-compose.prod.yml      # File cấu hình Docker Compose cho production
├── .env                          # File biến môi trường (tạo mới)
├── deploy.sh                     # Script deploy tự động (tùy chọn)
├── database_merged.sql           # Schema database
├── import_data.sql               # Dữ liệu mẫu
└── nginx/
    ├── Dockerfile                # Dockerfile cho Nginx
    └── nginx.conf                # Cấu hình Nginx
```

### 2. Dockerfile của các services
```
backend/
├── user-auth-service/Dockerfile
├── quiz-service/Dockerfile
├── notification-service/Dockerfile
└── class-assignment-service/Dockerfile

frontend/
└── Dockerfile

nginx/
└── Dockerfile
```

---

## ⚙️ Chuẩn bị môi trường

### Bước 1: Cài đặt Docker và Docker Compose

#### Ubuntu/Debian
```bash
# Update system
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group (để không cần sudo)
sudo usermod -aG docker $USER
newgrp docker
```

#### CentOS/RHEL
```bash
# Install Docker
sudo yum install -y docker docker-compose-plugin
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### Bước 2: Clone repository
```bash
# Clone project
cd /srv  # hoặc thư mục bạn muốn
git clone <repository-url> SE2025-17.1
cd SE2025-17.1
```

### Bước 3: Tạo file .env

Tạo file `.env` trong thư mục gốc của project:

```bash
nano .env
```

Nội dung file `.env`:

```env
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
DB_NAME=quizz
DB_HOST=postgres
DB_PORT=5432

# JWT Configuration
JWT_SECRET=5020f057d0d31c44d2397a3265c89b86b95a1903160610e290786cfe36e43e7b

# Frontend URL (thay bằng IP/domain của server)
FRONTEND_URL=http://YOUR_SERVER_IP

# SMTP Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Quiz App

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# RabbitMQ Configuration
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
```

**Lưu ý quan trọng:**
- Thay `YOUR_SERVER_IP` bằng IP thực tế của server (ví dụ: `http://136.110.11.83`)
- Để gửi email qua Gmail, cần tạo **App Password**:
  1. Vào Google Account → Security
  2. Bật 2-Step Verification
  3. Tạo App Password
  4. Copy password vào `SMTP_PASSWORD`

### Bước 4: Tạo file .env cho Frontend

```bash
# Tạo file .env.production cho frontend
cat > frontend/.env.production << EOF
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP/api/v1
NEXT_PUBLIC_AUTH_API_URL=http://YOUR_SERVER_IP/api/v1
NEXT_PUBLIC_QUIZ_API_URL=http://YOUR_SERVER_IP/api/v1
NEXT_PUBLIC_NOTIFICATION_API_URL=http://YOUR_SERVER_IP/api/v1
EOF
```

**Thay `YOUR_SERVER_IP` bằng IP thực tế của server.**

---

## 🚀 Deploy trên Server

### Cách 1: Deploy thủ công (Khuyến nghị)

#### Bước 1: Dừng các container cũ (nếu có)
```bash
cd /srv/SE2025-17.1
docker compose -f docker-compose.prod.yml down
```

#### Bước 2: Pull code mới nhất
```bash
git pull origin main
```

#### Bước 3: Build và chạy services
```bash
# Build và start tất cả services
docker compose -f docker-compose.prod.yml up -d --build

# Hoặc build từng service (nếu cần)
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

#### Bước 4: Kiểm tra logs
```bash
# Xem logs của tất cả services
docker compose -f docker-compose.prod.yml logs -f

# Xem logs của service cụ thể
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f user-auth-service
docker compose -f docker-compose.prod.yml logs -f quiz-service
docker compose -f docker-compose.prod.yml logs -f notification-service
```

#### Bước 5: Đợi services khởi động
```bash
# Đợi khoảng 30-60 giây để các services khởi động hoàn toàn
sleep 60

# Kiểm tra trạng thái
docker compose -f docker-compose.prod.yml ps
```

#### Bước 6: Khởi tạo database và import data
```bash
# Import schema database (nếu chưa có)
docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d quizz < database_merged.sql

# Import dữ liệu mẫu (tùy chọn)
docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d quizz < import_data.sql
```

### Cách 2: Deploy tự động bằng script

#### Sử dụng deploy.sh
```bash
# Cấp quyền thực thi
chmod +x deploy.sh

# Chỉnh sửa thông tin server trong deploy.sh
nano deploy.sh
# Thay đổi:
# - SERVER_USER
# - SERVER_IP
# - PROJECT_DIR

# Chạy script
./deploy.sh
```

**Lưu ý:** Script này sẽ tự động:
- Pull code mới nhất
- Tạo file .env
- Build và start containers
- Import email templates

---

## ✅ Kiểm tra sau khi deploy

### 1. Kiểm tra containers đang chạy
```bash
docker compose -f docker-compose.prod.yml ps
```

Kết quả mong đợi:
```
NAME                      STATUS          PORTS
frontend                  Up              0.0.0.0:3000->3000/tcp
user-auth-service         Up              0.0.0.0:8082->8082/tcp
quiz-service              Up              0.0.0.0:8083->8083/tcp
notification-service      Up              0.0.0.0:8080->8080/tcp
nginx                     Up              0.0.0.0:80->80/tcp
postgres                  Up (healthy)    0.0.0.0:5432->5432/tcp
redis                     Up              0.0.0.0:6379->6379/tcp
rabbitmq                  Up              0.0.0.0:5672->5672/tcp, 0.0.0.0:15672->15672/tcp
```

### 2. Kiểm tra health của services
```bash
# Frontend
curl http://localhost:3000

# User Auth Service
curl http://localhost:8082/actuator/health

# Quiz Service
curl http://localhost:8083/health

# Notification Service
curl http://localhost:8080/health

# Nginx
curl http://localhost
```

### 3. Kiểm tra database
```bash
# Kết nối vào database
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d quizz

# Kiểm tra tables
\dt

# Kiểm tra số lượng records
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'quizzes', COUNT(*) FROM quizzes
UNION ALL
SELECT 'classes', COUNT(*) FROM classes;
```

### 4. Kiểm tra truy cập từ bên ngoài
```bash
# Thay YOUR_SERVER_IP bằng IP thực tế
curl http://YOUR_SERVER_IP
curl http://YOUR_SERVER_IP/api/v1/auth/health
```

### 5. Kiểm tra RabbitMQ Management
```bash
# Truy cập: http://YOUR_SERVER_IP:15672
# Username: guest
# Password: guest
```

---

## 🔍 Troubleshooting

### Vấn đề 1: Container không start được

**Kiểm tra logs:**
```bash
docker compose -f docker-compose.prod.yml logs [service-name]
```

**Các nguyên nhân thường gặp:**
- Port đã được sử dụng
- Thiếu biến môi trường trong .env
- Lỗi build Docker image

**Giải pháp:**
```bash
# Kiểm tra port đang sử dụng
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :5432

# Dừng service đang dùng port
sudo systemctl stop apache2  # hoặc nginx
sudo systemctl stop postgresql

# Rebuild và restart
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build
```

### Vấn đề 2: Database connection error

**Kiểm tra:**
```bash
# Kiểm tra postgres container
docker compose -f docker-compose.prod.yml ps postgres

# Kiểm tra logs
docker compose -f docker-compose.prod.yml logs postgres

# Test connection
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d quizz -c "SELECT 1;"
```

**Giải pháp:**
```bash
# Restart postgres
docker compose -f docker-compose.prod.yml restart postgres

# Kiểm tra .env file có đúng không
cat .env | grep DB_
```

### Vấn đề 3: Frontend không load được

**Kiểm tra:**
```bash
# Kiểm tra frontend container
docker compose -f docker-compose.prod.yml logs frontend

# Kiểm tra nginx
docker compose -f docker-compose.prod.yml logs nginx

# Test frontend trực tiếp
curl http://localhost:3000
```

**Giải pháp:**
```bash
# Rebuild frontend
docker compose -f docker-compose.prod.yml build frontend
docker compose -f docker-compose.prod.yml up -d frontend

# Restart nginx
docker compose -f docker-compose.prod.yml restart nginx
```

### Vấn đề 4: Email không gửi được

**Kiểm tra:**
```bash
# Kiểm tra notification service logs
docker compose -f docker-compose.prod.yml logs notification-service

# Kiểm tra SMTP config trong .env
cat .env | grep SMTP_
```

**Giải pháp:**
- Đảm bảo đã tạo Gmail App Password (không phải password thường)
- Kiểm tra SMTP credentials trong .env
- Test SMTP connection:
```bash
docker compose -f docker-compose.prod.yml exec notification-service wget -O- http://localhost:8080/health
```

### Vấn đề 5: Port đã được sử dụng

**Kiểm tra port:**
```bash
sudo lsof -i :80
sudo lsof -i :5432
sudo lsof -i :3000
```

**Giải pháp:**
```bash
# Dừng service đang dùng port
sudo systemctl stop nginx
sudo systemctl stop apache2
sudo systemctl stop postgresql

# Hoặc thay đổi port trong docker-compose.prod.yml
```

### Vấn đề 6: Out of memory

**Kiểm tra:**
```bash
free -h
docker stats
```

**Giải pháp:**
```bash
# Dọn dẹp Docker
docker system prune -a

# Giảm số lượng services chạy đồng thời
# Hoặc tăng RAM cho server
```

---

## 📊 Monitoring và Maintenance

### Xem resource usage
```bash
# Xem CPU, RAM của containers
docker stats

# Xem disk usage
docker system df
df -h
```

### Backup database
```bash
# Backup database
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres quizz > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d quizz < backup_20240101_120000.sql
```

### Update services
```bash
# Pull code mới
git pull origin main

# Rebuild và restart
docker compose -f docker-compose.prod.yml up -d --build

# Hoặc restart từng service
docker compose -f docker-compose.prod.yml restart [service-name]
```

### Clean up
```bash
# Dừng và xóa containers
docker compose -f docker-compose.prod.yml down

# Xóa volumes (CẨN THẬN: sẽ mất data)
docker compose -f docker-compose.prod.yml down -v

# Xóa images cũ
docker image prune -a
```

---

## 🔐 Security Best Practices

### 1. Thay đổi password mặc định
```bash
# Tạo password mạnh cho database
openssl rand -base64 32

# Cập nhật trong .env
POSTGRES_PASSWORD=<strong-password>
```

### 2. Cấu hình firewall
```bash
# Chỉ mở các port cần thiết
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. Sử dụng HTTPS (khuyến nghị)
- Cài đặt Let's Encrypt SSL certificate
- Cấu hình Nginx để redirect HTTP → HTTPS
- Cập nhật FRONTEND_URL trong .env thành https://

### 4. Backup định kỳ
```bash
# Tạo cron job để backup hàng ngày
crontab -e

# Thêm dòng:
0 2 * * * cd /srv/SE2025-17.1 && docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres quizz > /backup/quiz_db_$(date +\%Y\%m\%d).sql
```

---

## 📞 Support

Nếu gặp vấn đề khi deploy, kiểm tra:
1. Logs của các services: `docker compose logs -f`
2. File `.env` có đúng format không
3. Ports có bị conflict không
4. Database có khởi động đúng không
5. Network connectivity giữa các containers

---

## ✅ Checklist trước khi deploy

- [ ] Docker và Docker Compose đã cài đặt
- [ ] File `.env` đã được tạo và cấu hình đúng
- [ ] File `frontend/.env.production` đã được tạo
- [ ] SMTP credentials đã được cấu hình (nếu cần gửi email)
- [ ] Ports 80, 5432, 6379, 5672 không bị conflict
- [ ] Đã clone repository về server
- [ ] Đã kiểm tra disk space đủ
- [ ] Firewall đã được cấu hình đúng

---

**Chúc bạn deploy thành công! 🎉**

