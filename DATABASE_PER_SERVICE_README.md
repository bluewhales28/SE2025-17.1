# 🗄️ Database Per Service - Complete Implementation

## 📋 Tổng quan

Hệ thống Quiz App đã được **migrate hoàn toàn** từ kiến trúc **Shared Database** sang **Database per Service** theo đúng chuẩn Microservices Architecture.

## 🎯 Vấn đề đã giải quyết

### ❌ Trước đây (Shared Database)
```
┌─────────────────────────────────────────┐
│      Shared PostgreSQL Database         │
│           (quizz database)              │
├─────────────────────────────────────────┤
│  Users, Classes, Quizzes, Assignments  │
│  Questions, Attempts, Notifications     │
└─────────────────────────────────────────┘
         ↑         ↑         ↑
         │         │         │
    ┌────┴───┐ ┌──┴───┐ ┌───┴────┐
    │ Auth   │ │ Quiz │ │ Class  │
    │Service │ │Service│ │Service │
    └────────┘ └──────┘ └────────┘
```

**Vấn đề:**
- ❌ Tight coupling giữa các services
- ❌ Không thể scale database riêng lẻ
- ❌ Schema changes ảnh hưởng nhiều services
- ❌ Single point of failure

### ✅ Bây giờ (Database per Service)
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Auth DB  │  │ Quiz DB  │  │ Class DB │  │Notif DB  │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │              │              │
     ↓             ↓              ↓              ↓
┌─────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐
│  Auth   │  │   Quiz   │  │   Class   │  │  Notif   │
│ Service │◄─┤  Service │◄─┤  Service  │◄─┤ Service  │
└─────────┘  └──────────┘  └───────────┘  └──────────┘
    (API calls thay vì foreign keys)
```

## 📚 Documentation

### 1. [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
**Tổng quan implementation** - Xem file này để hiểu toàn bộ những gì đã làm

### 2. [DATABASE_PER_SERVICE_MIGRATION.md](./DATABASE_PER_SERVICE_MIGRATION.md)
**Hướng dẫn chi tiết** - Document đầy đủ về:
- Kiến trúc mới
- Phân chia database schemas
- Xử lý cross-service data access
- Best practices

### 3. [QUICKSTART_DATABASE_MIGRATION.md](./QUICKSTART_DATABASE_MIGRATION.md)
**Quick Start Guide** - Commands nhanh để:
- Chạy migration
- Test system
- Rollback nếu cần

### 4. [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)
**Kiến trúc diagram** - Visualize toàn bộ hệ thống

## 🚀 Quick Start

### Step 1: Setup
```bash
# Clone và cd vào project
cd SE2025-17.1

# Copy environment variables
cp .env.microservices.example .env

# Edit với credentials thực tế
nano .env
```

### Step 2: Run Migration
```bash
# Trên Linux/Mac/Git Bash
bash migrate-to-microservices.sh

# Hoặc trên Windows PowerShell
sh migrate-to-microservices.sh
```

### Step 3: Verify
```bash
# Test all databases and services
bash test-database-per-service.sh

# Check running containers
docker-compose -f docker-compose.microservices.yml ps
```

## 📊 Services & Databases

| Service | Port | Database | DB Port | Schema File |
|---------|------|----------|---------|-------------|
| User Auth | 8080 | user_auth_db | 5432 | `backend/user-auth-service/schema/init.sql` |
| Quiz | 8083 | quiz_db | 5433 | `backend/quiz-service/db/schema.sql` |
| Class | 8081 | class_db | 5434 | `backend/class-assignment-service/schema/init.sql` |
| Notification | 8082 | notification_db | 5435 | `backend/notification-service/schema/init.sql` |
| Recommendation | 8085 | recommendation_db | 5436 | `backend/recommendation-service/schema/init.sql` |
| Analytics | 8084 | analytics_db | 5437 | `backend/analytics-statistic-service/schema/init.sql` |

## 🗂️ File Structure

```
SE2025-17.1/
├── 📄 IMPLEMENTATION_SUMMARY.md          ← Start here!
├── 📄 DATABASE_PER_SERVICE_MIGRATION.md  ← Detailed guide
├── 📄 QUICKSTART_DATABASE_MIGRATION.md   ← Quick commands
├── 📄 ARCHITECTURE_DIAGRAM.md            ← Visual architecture
│
├── 🐳 docker-compose.microservices.yml   ← New docker compose
├── 🔧 .env.microservices.example         ← Environment template
│
├── 🔨 migrate-to-microservices.sh        ← Migration script
├── 🔨 test-database-per-service.sh       ← Test script
├── 🔨 rollback-migration.sh              ← Rollback script
│
└── backend/
    ├── user-auth-service/schema/
    │   └── init.sql                      ← user_auth_db schema
    ├── quiz-service/db/
    │   └── schema.sql                    ← quiz_db schema
    ├── class-assignment-service/schema/
    │   └── init.sql                      ← class_db schema
    ├── notification-service/schema/
    │   └── init.sql                      ← notification_db schema
    ├── recommendation-service/schema/
    │   └── init.sql                      ← recommendation_db schema
    └── analytics-statistic-service/schema/
        └── init.sql                      ← analytics_db schema
```

## 🔍 Verify Implementation

### Check Database Isolation
```bash
# Should work (own database)
docker exec user-auth-db psql -U auth_user -d user_auth_db -c "SELECT COUNT(*) FROM users"

# Should fail (not own database)
docker exec user-auth-db psql -U auth_user -d user_auth_db -c "SELECT COUNT(*) FROM quizzes"
# Expected: ERROR: relation "quizzes" does not exist
```

### Check Services
```bash
# Health checks
curl http://localhost:8080/actuator/health  # Auth Service
curl http://localhost:8083/health           # Quiz Service
curl http://localhost:8082/health           # Notification Service
```

### Check Logs
```bash
# View all services
docker-compose -f docker-compose.microservices.yml logs -f

# View specific service
docker-compose -f docker-compose.microservices.yml logs -f quiz-service
```

## 🔄 Common Commands

### Start System
```bash
docker-compose -f docker-compose.microservices.yml up -d
```

### Stop System
```bash
docker-compose -f docker-compose.microservices.yml down
```

### View Status
```bash
docker-compose -f docker-compose.microservices.yml ps
```

### Connect to Database
```bash
# User Auth DB
docker exec -it user-auth-db psql -U auth_user -d user_auth_db

# Quiz DB
docker exec -it quiz-db psql -U quiz_user -d quiz_db

# Class DB
docker exec -it class-db psql -U class_user -d class_db
```

### Backup Database
```bash
# Backup user auth DB
docker exec user-auth-db pg_dump -U auth_user user_auth_db > backup_auth_$(date +%Y%m%d).sql

# Backup quiz DB
docker exec quiz-db pg_dump -U quiz_user quiz_db > backup_quiz_$(date +%Y%m%d).sql
```

## 🛡️ Security Checklist

- [ ] Change all default passwords in `.env`
- [ ] Use strong passwords (min 16 chars, mixed case, numbers, symbols)
- [ ] Don't commit `.env` to git (already in .gitignore)
- [ ] Use different credentials for each database
- [ ] Enable SSL for database connections in production
- [ ] Implement API authentication between services
- [ ] Add rate limiting on API Gateway
- [ ] Enable database encryption at rest

## 📈 Next Steps

1. **Implement Inter-Service Communication**
   - Add REST clients in services
   - Implement circuit breakers
   - Add retries and timeouts

2. **Event-Driven Architecture**
   - Setup RabbitMQ consumers
   - Implement SAGA pattern
   - Add event sourcing

3. **Monitoring**
   - Add Prometheus metrics
   - Setup Grafana dashboards
   - Implement distributed tracing

4. **Testing**
   - Integration tests with Testcontainers
   - Load testing
   - Chaos engineering

5. **Production Readiness**
   - SSL/TLS configuration
   - Backup automation
   - Disaster recovery plan
   - CI/CD pipeline

## 🐛 Troubleshooting

### Database won't start
```bash
# Check logs
docker logs user-auth-db

# Check if port is already in use
netstat -an | grep 5432

# Remove volumes and restart
docker-compose -f docker-compose.microservices.yml down -v
docker-compose -f docker-compose.microservices.yml up -d
```

### Service can't connect to database
```bash
# Check network
docker network ls
docker network inspect se2025-171_app-network

# Check environment variables
docker exec user-auth-service env | grep DB

# Check database is ready
docker exec user-auth-db pg_isready -U auth_user -d user_auth_db
```

### Need to rollback
```bash
# Use rollback script
bash rollback-migration.sh

# Or manually
docker-compose -f docker-compose.microservices.yml down
docker-compose up -d
```

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra logs: `docker-compose -f docker-compose.microservices.yml logs`
2. Chạy test: `bash test-database-per-service.sh`
3. Xem [DATABASE_PER_SERVICE_MIGRATION.md](./DATABASE_PER_SERVICE_MIGRATION.md) section "Troubleshooting"

## ✅ Checklist

- [x] Tạo schema files riêng cho mỗi service
- [x] Xóa foreign keys giữa các services
- [x] Tạo docker-compose mới với 6 databases
- [x] Tạo migration scripts
- [x] Tạo test scripts
- [x] Tạo documentation đầy đủ
- [x] Tạo rollback plan

## 🎉 Kết luận

Hệ thống đã được migrate thành công sang **Database per Service** architecture. Mỗi microservice giờ có database riêng, độc lập và có thể scale riêng lẻ.

**Next**: Implement inter-service communication và event-driven patterns!

---

**Last Updated**: December 5, 2025  
**Status**: ✅ Implementation Complete  
**Architecture**: Microservices with Database per Service
