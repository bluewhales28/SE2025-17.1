# Hướng Dẫn Deploy và Thay Đổi Server

## 📋 Mục Lục
1. [Các File Cần Thay Đổi Khi Đổi Server](#các-file-cần-thay-đổi)
2. [Hướng Dẫn Deploy Lên Server](#hướng-dẫn-deploy)
3. [Troubleshooting](#troubleshooting)

---

## 🔧 Các File Cần Thay Đổi Khi Đổi Server

### 1. **deploy.sh** - Script Deploy Chính
```bash
# Dòng 11-13: Thông tin server
SERVER_USER="lequangtin_t67"      # ← Đổi username
SERVER_IP="136.110.11.83"          # ← Đổi IP server mới
PROJECT_DIR="/srv"                 # ← Đổi thư mục project (nếu cần)
```

**Vị trí:** `deploy.sh` (root folder)

---

### 2. **docker-compose.prod.yml** - Environment Variables

#### Frontend Service
```yaml
frontend:
  environment:
    - NEXT_PUBLIC_API_URL=http://136.110.11.83/api/v1  # ← Đổi IP/domain
```

#### User Auth Service
```yaml
user-auth-service:
  environment:
    - FRONTEND_URL=http://136.110.11.83  # ← Đổi IP/domain
    - JWT_SECRET=your-secret-key         # ← Đổi secret key (production)
```

#### Notification Service
```yaml
notification-service:
  environment:
    - SMTP_HOST=smtp.gmail.com          # ← Đổi SMTP server
    - SMTP_PORT=587
    - SMTP_USER=luntanson@gmail.com     # ← Đổi email
    - SMTP_PASSWORD=rfca yvny tdab drdv # ← Đổi app password
    - SMTP_FROM_EMAIL=luntanson@gmail.com
```

#### Database
```yaml
postgres:
  environment:
    - POSTGRES_USER=postgres      # ← Đổi DB username
    - POSTGRES_PASSWORD=password  # ← ĐỔI PASSWORD (bắt buộc!)
    - POSTGRES_DB=quizz
```

**Vị trí:** `docker-compose.prod.yml` (root folder)

---

### 3. **frontend/.env.production** - Frontend Config
```env
NEXT_PUBLIC_API_URL=http://136.110.11.83/api/v1  # ← Đổi IP/domain
```

**Vị trí:** `frontend/.env.production`

**Nếu file không tồn tại, tạo mới:**
```bash
echo 'NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP/api/v1' > frontend/.env.production
```

---

### 4. **nginx/nginx.conf** - Reverse Proxy (Tùy chọn)

Nếu dùng domain thay vì IP:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # ← Đổi domain
    # ... rest of config
}
```

**Vị trí:** `nginx/nginx.conf`

---

### 5. **.env** (Server) - Full Environment Config

**File này được tạo tự động bởi `deploy.sh`**, nhưng bạn có thể chỉnh sửa trên server:

```bash
# Kết nối server
ssh your_user@your_server_ip

# Chỉnh sửa .env
cd /srv/SE2025-17.1
sudo nano .env
```

**Nội dung cần thay đổi:**
```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CHANGE_THIS_PASSWORD  # ← ĐỔI!
DB_NAME=quizz

# JWT
JWT_SECRET=CHANGE_THIS_SECRET_KEY       # ← ĐỔI!

# Frontend
FRONTEND_URL=http://YOUR_SERVER_IP      # ← ĐỔI!

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com          # ← ĐỔI!
SMTP_PASSWORD=your_app_password         # ← ĐỔI!
SMTP_FROM_EMAIL=your_email@gmail.com
SMTP_FROM_NAME=Quiz App
```

---

### 6. **SSH Config** (Local Machine)

Để SSH nhanh không cần nhập password:

**File:** `~/.ssh/config` (Linux/Mac) hoặc `C:\Users\YourName\.ssh\config` (Windows)

```ssh
Host quiz-server
    HostName 136.110.11.83        # ← IP server mới
    User lequangtin_t67           # ← Username
    IdentityFile ~/.ssh/id_rsa    # ← SSH key (nếu có)
```

**Sử dụng:**
```bash
ssh quiz-server  # Thay vì ssh user@ip
```

---

## 🚀 Hướng Dẫn Deploy Lên Server

### **Bước 1: Chuẩn Bị Server**

#### 1.1. Kết nối SSH
```bash
ssh your_username@your_server_ip
```

#### 1.2. Cài Đặt Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Cài Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Cài Docker Compose
sudo apt install docker-compose-plugin -y

# Add user to docker group (không cần sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker compose version
```

#### 1.3. Cài Git
```bash
sudo apt install git -y
git --version
```

#### 1.4. Clone Project
```bash
# Tạo thư mục
sudo mkdir -p /srv
sudo chown $USER:$USER /srv

# Clone repository
cd /srv
git clone https://github.com/bluewhales28/SE2025-17.1.git
cd SE2025-17.1
```

---

### **Bước 2: Cấu Hình Project**

#### 2.1. Set Git Safe Directory
```bash
git config --global --add safe.directory /srv/SE2025-17.1
```

#### 2.2. Tạo File .env
```bash
cat > .env << 'EOF'
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_strong_password_here
DB_NAME=quizz
JWT_SECRET=your_jwt_secret_key_minimum_32_chars
FRONTEND_URL=http://136.110.11.83
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
SMTP_FROM_NAME=Quiz App
EOF
```

#### 2.3. Tạo Frontend .env
```bash
echo "NEXT_PUBLIC_API_URL=http://136.110.11.83/api/v1" > frontend/.env.production
```

---

### **Bước 3: Deploy Application**

#### 3.1. Enable Docker BuildKit
```bash
export DOCKER_BUILDKIT=1
```

#### 3.2. Build Images
```bash
# Build tất cả services song song
sudo docker compose -f docker-compose.prod.yml build --parallel

# Hoặc build từng service
sudo docker compose -f docker-compose.prod.yml build frontend
sudo docker compose -f docker-compose.prod.yml build user-auth-service
sudo docker compose -f docker-compose.prod.yml build quiz-service
sudo docker compose -f docker-compose.prod.yml build notification-service
```

**Thời gian build lần đầu:** ~5-10 phút

#### 3.3. Start Services
```bash
sudo docker compose -f docker-compose.prod.yml up -d
```

#### 3.4. Verify Containers
```bash
sudo docker ps
```

**Kết quả mong đợi:**
```
NAMES                  STATUS
nginx                  Up X minutes
frontend               Up X minutes
user-auth-service      Up X minutes (healthy)
quiz-service           Up X minutes (healthy)
notification-service   Up X minutes (healthy)
postgres               Up X minutes (healthy)
redis                  Up X minutes
rabbitmq               Up X minutes
```

---

### **Bước 4: Cấu Hình Firewall**

#### 4.1. Allow HTTP/HTTPS
```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

#### 4.2. Google Cloud Platform (GCP)
```bash
# Sử dụng gcloud CLI
gcloud compute firewall-rules create allow-http \
  --allow tcp:80 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow HTTP traffic"

gcloud compute firewall-rules create allow-https \
  --allow tcp:443 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow HTTPS traffic"
```

**Hoặc qua Web Console:**
1. VPC Network → Firewall → Create Firewall Rule
2. Name: `allow-http`
3. Targets: All instances
4. Source IP ranges: `0.0.0.0/0`
5. Protocols/ports: `tcp:80,443`

---

### **Bước 5: Insert Email Templates**

```bash
# Wait cho postgres healthy
sleep 30

# Insert templates
sudo docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d quizz << 'SQL'
INSERT INTO email_templates (name, subject, body_html, body_text, channel) VALUES
('password_reset', 'Password Reset Request - Quiz App', 
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1>Password Reset Request</h1>
  <p>Hello {{.user_name}},</p>
  <p>Click the link below to reset your password:</p>
  <p><a href="{{.reset_url}}">Reset Password</a></p>
  <p>This link will expire in 1 hour.</p>
 </div>', 
 'Password reset request. Click link to reset: {{.reset_url}}', 
 'email'),

('user_registered', 'Welcome to Quiz App', 
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1>Welcome to Quiz App</h1>
  <p>Hello {{.user_name}},</p>
  <p>Thank you for joining our community.</p>
 </div>', 
 'Welcome to Quiz App. Thank you for joining our community.', 
 'email')
ON CONFLICT (name) DO NOTHING;
SQL
```

---

### **Bước 6: Test Application**

#### 6.1. Test Frontend
```bash
curl http://localhost/
```

#### 6.2. Test Backend APIs
```bash
# User Auth Service
curl http://localhost/api/v1/auth/health

# Quiz Service
curl http://localhost:8083/health

# Notification Service
curl http://localhost:8080/health
```

#### 6.3. Test RabbitMQ Management
Browser: `http://YOUR_SERVER_IP:15672`
- Username: `guest`
- Password: `guest`

---

## 📝 Deploy Từ Local Machine

### **Option 1: Sử dụng deploy.sh Script**

#### 1. Update thông tin server trong `deploy.sh`
```bash
SERVER_USER="your_username"
SERVER_IP="your_server_ip"
```

#### 2. Chạy script
```bash
./deploy.sh
```

**Script sẽ tự động:**
- Pull code mới từ Git
- Build Docker images
- Start/restart containers
- Insert email templates

---

### **Option 2: Manual Deploy**

```bash
# 1. Push code lên Git
git add .
git commit -m "Update configs"
git push origin main

# 2. SSH vào server
ssh your_user@your_server_ip

# 3. Pull code mới
cd /srv/SE2025-17.1
git pull origin main

# 4. Rebuild và restart
export DOCKER_BUILDKIT=1
sudo docker compose -f docker-compose.prod.yml build --parallel
sudo docker compose -f docker-compose.prod.yml up -d

# 5. Check logs
sudo docker compose -f docker-compose.prod.yml logs -f
```

---

## 🔍 Troubleshooting

### **1. Container Keep Restarting**

**Kiểm tra logs:**
```bash
sudo docker logs user-auth-service --tail 50
sudo docker logs quiz-service --tail 50
sudo docker logs notification-service --tail 50
```

**Common issues:**
- Database chưa ready → Wait thêm 30s
- Missing Java modules → Check JLink modules
- Port conflict → Check `docker ps` và ports

---

### **2. Cannot Connect to Database**

**Check postgres:**
```bash
sudo docker exec -it postgres psql -U postgres -d quizz
```

**Test connection:**
```sql
\dt  -- List tables
\q   -- Quit
```

---

### **3. Build Failed - Out of Memory**

**Tăng Docker memory:**
```bash
# Check memory
free -h

# Increase swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

### **4. Frontend Not Loading**

**Check nginx config:**
```bash
sudo docker exec nginx nginx -t
```

**Restart nginx:**
```bash
sudo docker restart nginx
```

---

### **5. Email Not Sending**

**Check SMTP credentials:**
```bash
# Test SMTP connection
telnet smtp.gmail.com 587

# Check notification logs
sudo docker logs notification-service | grep -i error
```

**Gmail App Password:**
1. Google Account → Security
2. 2-Step Verification → ON
3. App passwords → Generate
4. Copy password vào `.env`

---

### **6. High CPU/Memory Usage**

**Monitor resources:**
```bash
# Real-time stats
sudo docker stats

# Check specific container
sudo docker stats user-auth-service
```

**Optimize:**
```bash
# Prune unused images
sudo docker image prune -a

# Prune unused volumes
sudo docker volume prune
```

---

## 📊 Monitoring

### **Check Service Health**
```bash
# All containers
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Specific service
sudo docker inspect user-auth-service | grep -i health
```

### **View Logs**
```bash
# All services
sudo docker compose -f docker-compose.prod.yml logs -f

# Specific service
sudo docker logs -f user-auth-service

# Last 100 lines
sudo docker logs --tail 100 quiz-service
```

### **Resource Usage**
```bash
# Disk usage
sudo docker system df

# Image sizes
sudo docker images | grep se2025-171
```

---

## 🔐 Security Best Practices

### **1. Change Default Passwords**
```bash
# Database
POSTGRES_PASSWORD=USE_STRONG_PASSWORD_HERE

# JWT Secret (minimum 32 chars)
JWT_SECRET=$(openssl rand -hex 32)
```

### **2. Setup SSL/TLS (Production)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com
```

### **3. Restrict RabbitMQ Access**
```yaml
# docker-compose.prod.yml
rabbitmq:
  ports:
    # Comment out to disable external access
    # - "15672:15672"  
```

### **4. Enable Docker Content Trust**
```bash
export DOCKER_CONTENT_TRUST=1
```

---

## 📦 Backup & Restore

### **Backup Database**
```bash
# Backup
sudo docker exec postgres pg_dump -U postgres quizz > backup_$(date +%Y%m%d).sql

# Restore
sudo docker exec -i postgres psql -U postgres quizz < backup_20241211.sql
```

### **Backup Volumes**
```bash
# Backup volume
sudo docker run --rm -v se2025-171_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_data.tar.gz -C /data .

# Restore volume
sudo docker run --rm -v se2025-171_postgres_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/postgres_data.tar.gz -C /data
```

---

## 🎯 Quick Commands Cheat Sheet

```bash
# Build all services
sudo docker compose -f docker-compose.prod.yml build --parallel

# Start all services
sudo docker compose -f docker-compose.prod.yml up -d

# Stop all services
sudo docker compose -f docker-compose.prod.yml down

# Restart specific service
sudo docker compose -f docker-compose.prod.yml restart user-auth-service

# View logs
sudo docker compose -f docker-compose.prod.yml logs -f

# Check status
sudo docker ps

# Clean up
sudo docker system prune -af --volumes

# SSH to container
sudo docker exec -it user-auth-service sh
```

---

## 📞 Support

**GitHub Issues:** https://github.com/bluewhales28/SE2025-17.1/issues

**Docker Documentation:** https://docs.docker.com/

**Common Errors:** Check logs first - 90% of issues show in logs!
