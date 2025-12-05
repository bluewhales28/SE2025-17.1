# Docker Compose Setup

File docker-compose.yml này để chạy user-auth-service và frontend.

## Services

- **postgres18**: PostgreSQL database (port 5432)
- **user-auth-service**: User authentication service (port 8082)
- **quiz-frontend**: Next.js frontend (port 3000)

## Quick Start

### 1. Tạo file .env (tùy chọn)

```bash
# Tạo file .env trong thư mục này
cat > .env << EOF
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_DB=quizz
JWT_SECRET=your-secret-key-here
NEXT_PUBLIC_API_URL=http://localhost/api/v1
EOF
```

### 2. Build và chạy services

```bash
# Build và start tất cả services
docker-compose up -d --build

# Hoặc chỉ start một service cụ thể
docker-compose up -d user-auth-service
```

### 3. Xem logs

```bash
# Xem logs của tất cả services
docker-compose logs -f

# Xem logs của một service cụ thể
docker-compose logs -f user-auth-service
```

### 4. Dừng services

```bash
# Dừng tất cả services
docker-compose down

# Dừng và xóa volumes (cẩn thận: sẽ mất dữ liệu!)
docker-compose down -v
```

## Environment Variables

Các biến môi trường có thể được set trong file `.env` hoặc trực tiếp trong docker-compose:

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | PostgreSQL username | `admin` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `admin123` |
| `POSTGRES_DB` | Database name | `quizz` |
| `JWT_SECRET` | JWT secret key | `changeme-to-a-long-secret-key-for-production-use-only` |
| `NEXT_PUBLIC_API_URL` | Frontend API URL | `http://localhost/api/v1` |

## Network

Tất cả services chạy trong network `app-network` và có thể giao tiếp với nhau qua tên container:
- `postgres18:5432`
- `user-auth-service:8082`

## Health Checks

PostgreSQL có health check tự động. user-auth-service sẽ đợi PostgreSQL healthy trước khi start.

## Troubleshooting

### Service không start được

1. Kiểm tra logs:
```bash
docker-compose logs <service-name>
```

2. Kiểm tra network:
```bash
docker network inspect docker_app-network
```

3. Kiểm tra database connection:
```bash
docker exec -it postgres18 psql -U admin -d quizz
```

### Port conflicts

Nếu port đã được sử dụng, bạn có thể:
- Thay đổi port mapping trong docker-compose.yml
- Hoặc dừng service đang dùng port đó

### Build failed

Nếu build failed, thử:
```bash
# Xóa cache và build lại
docker-compose build --no-cache <service-name>
```

## Access Services

- **Frontend**: http://localhost:3000
- **User Auth Service**: http://localhost:8082 (nếu expose port)
- **PostgreSQL**: localhost:5432

