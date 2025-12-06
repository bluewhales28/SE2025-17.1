# 🚀 Production-Ready Roadmap (7 Days)

Hướng dẫn chi tiết để nâng cấp hệ thống Quiz App lên mức Production-Ready trong 1 tuần.

**Tech Stack:** Docker Compose only, NO Kubernetes, 100% FREE tools.

---

## 📅 Timeline Overview

| Ngày | Task | Priority | Thời gian ước tính |
|------|------|----------|-------------------|
| 1 | CI/CD cho tất cả services | ⭐⭐⭐ | 3-4 giờ |
| 2 | Monitoring (Prometheus + Grafana) | ⭐⭐⭐ | 4-5 giờ |
| 3 | Centralized Logging (Loki) | ⭐⭐ | 3-4 giờ |
| 4 | API Documentation (Swagger) | ⭐⭐ | 2-3 giờ |
| 5 | Database Migration Tools | ⭐⭐ | 3-4 giờ |
| 6 | Health Checks & Alerts | ⭐⭐⭐ | 3-4 giờ |
| 7 | Security & Optimization | ⭐ | 2-3 giờ |

---

## 🎯 Ngày 1: CI/CD cho tất cả services

### Mục tiêu
Tự động hóa: Build → Test → Docker Push cho mỗi service khi có code thay đổi.

### Tasks

#### ✅ Task 1.1: CI cho User Auth Service (Java/Spring Boot)
**File:** `.github/workflows/user-auth-service-ci.yml`

```yaml
name: User Auth Service CI

on:
  push:
    branches: [ main, dev ]
    paths:
      - 'backend/user-auth-service/**'
      - '.github/workflows/user-auth-service-ci.yml'
  pull_request:
    branches: [ main, dev ]
    paths:
      - 'backend/user-auth-service/**'

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: maven
    
    - name: Build with Maven
      working-directory: ./backend/user-auth-service
      run: mvn clean package -DskipTests
    
    - name: Run Tests
      working-directory: ./backend/user-auth-service
      run: mvn test
    
    - name: Build Docker Image
      if: github.event_name == 'push'
      run: |
        docker build -t ${{ secrets.DOCKER_USERNAME }}/user-auth-service:${{ github.sha }} \
                     -t ${{ secrets.DOCKER_USERNAME }}/user-auth-service:latest \
                     ./backend/user-auth-service
    
    - name: Login to DockerHub
      if: github.event_name == 'push'
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Push to DockerHub
      if: github.event_name == 'push'
      run: |
        docker push ${{ secrets.DOCKER_USERNAME }}/user-auth-service:${{ github.sha }}
        docker push ${{ secrets.DOCKER_USERNAME }}/user-auth-service:latest
```

**Secrets cần thêm trong GitHub:**
- `DOCKER_USERNAME`: Username DockerHub của bạn
- `DOCKER_PASSWORD`: Password hoặc Access Token của DockerHub

---

#### ✅ Task 1.2: CI cho Quiz Service (Go)
**File:** `.github/workflows/quiz-service-ci.yml`

```yaml
name: Quiz Service CI

on:
  push:
    branches: [ main, dev ]
    paths:
      - 'backend/quiz-service/**'
      - '.github/workflows/quiz-service-ci.yml'
  pull_request:
    branches: [ main, dev ]
    paths:
      - 'backend/quiz-service/**'

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Go
      uses: actions/setup-go@v4
      with:
        go-version: '1.21'
        cache-dependency-path: backend/quiz-service/go.sum
    
    - name: Install Dependencies
      working-directory: ./backend/quiz-service
      run: go mod download
    
    - name: Run Tests
      working-directory: ./backend/quiz-service
      run: go test -v ./...
    
    - name: Build Binary
      working-directory: ./backend/quiz-service
      run: go build -o main .
    
    - name: Build Docker Image
      if: github.event_name == 'push'
      run: |
        docker build -t ${{ secrets.DOCKER_USERNAME }}/quiz-service:${{ github.sha }} \
                     -t ${{ secrets.DOCKER_USERNAME }}/quiz-service:latest \
                     ./backend/quiz-service
    
    - name: Login to DockerHub
      if: github.event_name == 'push'
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Push to DockerHub
      if: github.event_name == 'push'
      run: |
        docker push ${{ secrets.DOCKER_USERNAME }}/quiz-service:${{ github.sha }}
        docker push ${{ secrets.DOCKER_USERNAME }}/quiz-service:latest
```

---

#### ✅ Task 1.3: Verification

**Test CI locally:**
```bash
# Test Maven build
cd backend/user-auth-service
mvn clean test

# Test Go build
cd backend/quiz-service
go test ./...
go build -o main .
```

**Expected Result:**
- ✅ GitHub Actions chạy khi push code
- ✅ Docker images được push lên DockerHub
- ✅ Badge CI hiển thị trên README

---

## 🎯 Ngày 2: Monitoring (Prometheus + Grafana)

### Mục tiêu
Dashboard real-time hiển thị metrics: CPU, Memory, Request rate, Error rate.

### Tasks

#### ✅ Task 2.1: Thêm Prometheus & Grafana vào Docker Compose

**File:** `docker-compose.yml` (thêm vào cuối file)

```yaml
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    networks:
      - app-network
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
    networks:
      - app-network
    depends_on:
      - prometheus
    restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:
```

---

#### ✅ Task 2.2: Config Prometheus

**File:** `monitoring/prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  # User Auth Service (Spring Boot Actuator)
  - job_name: 'user-auth-service'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['user-auth-service:8082']

  # Quiz Service (Go)
  - job_name: 'quiz-service'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['quiz-service:8083']

  # Notification Service (Go)
  - job_name: 'notification-service'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['notification-service:8080']

  # Nginx
  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:9113']

  # PostgreSQL Exporter
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  # Redis Exporter
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

---

#### ✅ Task 2.3: Expose Metrics từ Services

**Java Service (User Auth):**

`pom.xml` - Thêm dependency:
```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

`application.yml` - Enable metrics:
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
```

**Go Services (Quiz, Notification):**

Thêm vào `main.go`:
```go
import (
    "github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
    r := gin.Default()
    
    // Metrics endpoint
    r.GET("/metrics", gin.WrapH(promhttp.Handler()))
    
    // ... rest of your code
}
```

---

#### ✅ Task 2.4: Setup Grafana Dashboards

**File:** `monitoring/grafana/datasources/prometheus.yml`

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
```

**Import dashboards có sẵn:**
1. Spring Boot Dashboard: https://grafana.com/grafana/dashboards/4701
2. Go Processes Dashboard: https://grafana.com/grafana/dashboards/6671
3. PostgreSQL Dashboard: https://grafana.com/grafana/dashboards/9628
4. Redis Dashboard: https://grafana.com/grafana/dashboards/11835
5. Nginx Dashboard: https://grafana.com/grafana/dashboards/12708

**Access:**
- Prometheus UI: http://localhost:9090
- Grafana UI: http://localhost:3001 (admin/admin123)

---

#### ✅ Task 2.5: Thêm Exporters

**File:** `docker-compose.yml` (thêm)

```yaml
  postgres-exporter:
    image: prometheuscommunity/postgres-exporter:latest
    container_name: postgres-exporter
    environment:
      DATA_SOURCE_NAME: "postgresql://postgres:password@postgres:5432/quizz?sslmode=disable"
    ports:
      - "9187:9187"
    networks:
      - app-network
    depends_on:
      - postgres

  redis-exporter:
    image: oliver006/redis_exporter:latest
    container_name: redis-exporter
    environment:
      REDIS_ADDR: redis:6379
    ports:
      - "9121:9121"
    networks:
      - app-network
    depends_on:
      - redis

  nginx-exporter:
    image: nginx/nginx-prometheus-exporter:latest
    container_name: nginx-exporter
    command:
      - '-nginx.scrape-uri=http://nginx:80/stub_status'
    ports:
      - "9113:9113"
    networks:
      - app-network
    depends_on:
      - nginx
```

---

## 🎯 Ngày 3: Centralized Logging (Loki + Promtail)

### Mục tiêu
Search tất cả logs của tất cả services trong một UI duy nhất (Grafana).

### Tasks

#### ✅ Task 3.1: Thêm Loki & Promtail

**File:** `docker-compose.yml`

```yaml
  loki:
    image: grafana/loki:latest
    container_name: loki
    ports:
      - "3100:3100"
    volumes:
      - ./monitoring/loki/loki-config.yml:/etc/loki/local-config.yaml
      - loki_data:/loki
    command: -config.file=/etc/loki/local-config.yaml
    networks:
      - app-network
    restart: unless-stopped

  promtail:
    image: grafana/promtail:latest
    container_name: promtail
    volumes:
      - ./monitoring/promtail/promtail-config.yml:/etc/promtail/config.yml
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock
    command: -config.file=/etc/promtail/config.yml
    networks:
      - app-network
    depends_on:
      - loki
    restart: unless-stopped

volumes:
  loki_data:
```

---

#### ✅ Task 3.2: Config Loki

**File:** `monitoring/loki/loki-config.yml`

```yaml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    final_sleep: 0s
  chunk_idle_period: 5m
  chunk_retain_period: 30s

schema_config:
  configs:
    - from: 2020-05-15
      store: boltdb
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 168h

storage_config:
  boltdb:
    directory: /loki/index
  filesystem:
    directory: /loki/chunks

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h

chunk_store_config:
  max_look_back_period: 0s

table_manager:
  retention_deletes_enabled: false
  retention_period: 0s
```

---

#### ✅ Task 3.3: Config Promtail

**File:** `monitoring/promtail/promtail-config.yml`

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        regex: '/(.*)'
        target_label: 'container'
      - source_labels: ['__meta_docker_container_log_stream']
        target_label: 'stream'
      - source_labels: ['__meta_docker_container_label_com_docker_compose_service']
        target_label: 'service'
```

---

#### ✅ Task 3.4: Thêm Loki Data Source vào Grafana

**File:** `monitoring/grafana/datasources/loki.yml`

```yaml
apiVersion: 1

datasources:
  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    editable: true
```

**Usage trong Grafana:**
1. Vào Explore → chọn Loki data source
2. Query: `{service="user-auth-service"} |= "ERROR"`
3. Query: `{container="frontend"} |= "404"`

---

## 🎯 Ngày 4: API Documentation (Swagger/OpenAPI)

### Mục tiêu
Tự động generate API docs từ code, có UI để test API.

### Tasks

#### ✅ Task 4.1: Swagger cho User Auth Service (Java)

**File:** `pom.xml` (thêm dependency)

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>
```

**File:** `application.yml` (thêm config)

```yaml
springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
    enabled: true
  info:
    title: User Auth Service API
    version: 1.0.0
    description: Authentication and User Management API
```

**Annotate Controllers:**

```java
@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Authentication endpoints")
public class AuthenticationController {
    
    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    public ApiResponse<AuthResponse> login(@RequestBody @Valid AuthRequest request) {
        // ...
    }
}
```

**Access:** http://localhost:8082/swagger-ui.html

---

#### ✅ Task 4.2: Swagger cho Quiz Service (Go)

**Install Swaggo:**

```bash
cd backend/quiz-service
go install github.com/swaggo/swag/cmd/swag@latest
go get -u github.com/swaggo/gin-swagger
go get -u github.com/swaggo/files
```

**File:** `main.go` (thêm import và route)

```go
import (
    swaggerFiles "github.com/swaggo/files"
    ginSwagger "github.com/swaggo/gin-swagger"
    _ "your-module/docs" // Import generated docs
)

// @title Quiz Service API
// @version 1.0
// @description Quiz Management API
// @host localhost:8083
// @BasePath /
func main() {
    r := gin.Default()
    
    // Swagger route
    r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
    
    // ... rest of your routes
}
```

**Annotate Handlers:**

```go
// CreateQuiz godoc
// @Summary Create a new quiz
// @Description Create a new quiz with questions
// @Tags quiz
// @Accept json
// @Produce json
// @Param quiz body QuizRequest true "Quiz data"
// @Success 201 {object} QuizResponse
// @Failure 400 {object} ErrorResponse
// @Router /quizzes [post]
func (h *QuizHandler) CreateQuiz(c *gin.Context) {
    // ...
}
```

**Generate docs:**

```bash
cd backend/quiz-service
swag init
```

**Access:** http://localhost:8083/swagger/index.html

---

#### ✅ Task 4.3: Swagger cho Notification Service (Go)

Làm tương tự như Quiz Service.

---

## 🎯 Ngày 5: Database Migration

### Mục tiêu
Database schema được version control, tự động migrate khi deploy.

### Tasks

#### ✅ Task 5.1: Flyway cho User Auth Service (Java)

**File:** `pom.xml`

```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
</dependency>
```

**File:** `application.yml`

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
    baseline-version: 0
```

**Tạo migration files:**

`src/main/resources/db/migration/V1__initial_schema.sql`:
```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    is_email_verified BOOLEAN DEFAULT TRUE,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

`src/main/resources/db/migration/V2__add_tokens.sql`:
```sql
-- Invalid tokens table
CREATE TABLE IF NOT EXISTS invalid_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(512) NOT NULL UNIQUE,
    expiration_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

#### ✅ Task 5.2: golang-migrate cho Go Services

**Install migrate CLI:**

```bash
# macOS/Linux
curl -L https://github.com/golang-migrate/migrate/releases/download/v4.17.0/migrate.linux-amd64.tar.gz | tar xvz
sudo mv migrate /usr/local/bin/

# Windows (download from GitHub releases)
```

**Tạo migrations cho Quiz Service:**

```bash
cd backend/quiz-service
migrate create -ext sql -dir db/migrations -seq initial_schema
```

**File:** `db/migrations/000001_initial_schema.up.sql`

```sql
-- Create quizzes table (example)
CREATE TABLE IF NOT EXISTS quizzes (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**File:** `db/migrations/000001_initial_schema.down.sql`

```sql
DROP TABLE IF EXISTS quizzes;
```

**Run migrations:**

```bash
migrate -path db/migrations -database "postgresql://postgres:password@localhost:5432/quiz_db?sslmode=disable" up
```

**Integrate vào code (main.go):**

```go
import "github.com/golang-migrate/migrate/v4"

func runMigrations(dbURL string) error {
    m, err := migrate.New(
        "file://db/migrations",
        dbURL,
    )
    if err != nil {
        return err
    }
    
    if err := m.Up(); err != nil && err != migrate.ErrNoChange {
        return err
    }
    
    return nil
}
```

---

## 🎯 Ngày 6: Health Checks & Alerts

### Mục tiêu
Services tự check dependencies, gửi alert khi có vấn đề.

### Tasks

#### ✅ Task 6.1: Health Check Endpoints

**Java Service:**

```java
@RestController
public class HealthController {
    
    @Autowired
    private DataSource dataSource;
    
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", System.currentTimeMillis());
        
        // Check DB
        try {
            dataSource.getConnection().close();
            health.put("database", "UP");
        } catch (Exception e) {
            health.put("database", "DOWN");
            health.put("status", "DOWN");
        }
        
        // Check RabbitMQ
        try {
            rabbitTemplate.getConnectionFactory().createConnection().close();
            health.put("rabbitmq", "UP");
        } catch (Exception e) {
            health.put("rabbitmq", "DOWN");
            health.put("status", "DOWN");
        }
        
        HttpStatus status = health.get("status").equals("UP") ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
        return ResponseEntity.status(status).body(health);
    }
}
```

**Go Service:**

```go
func HealthHandler(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        health := gin.H{
            "status":    "UP",
            "timestamp": time.Now().Unix(),
        }
        
        // Check DB
        sqlDB, _ := db.DB()
        if err := sqlDB.Ping(); err != nil {
            health["database"] = "DOWN"
            health["status"] = "DOWN"
        } else {
            health["database"] = "UP"
        }
        
        status := http.StatusOK
        if health["status"] == "DOWN" {
            status = http.StatusServiceUnavailable
        }
        
        c.JSON(status, health)
    }
}
```

---

#### ✅ Task 6.2: Docker Compose Health Checks

**File:** `docker-compose.yml` (update services)

```yaml
  user-auth-service:
    # ... existing config
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8082/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    depends_on:
      postgres:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy

  postgres:
    # ... existing config
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  rabbitmq:
    # ... existing config
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

#### ✅ Task 6.3: Prometheus AlertManager

**File:** `monitoring/alertmanager/alertmanager.yml`

```yaml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'telegram'

receivers:
  - name: 'telegram'
    telegram_configs:
      - bot_token: 'YOUR_BOT_TOKEN'
        chat_id: YOUR_CHAT_ID
        parse_mode: 'HTML'
        message: |
          <b>Alert:</b> {{ .GroupLabels.alertname }}
          <b>Severity:</b> {{ .CommonLabels.severity }}
          <b>Description:</b> {{ .CommonAnnotations.description }}
```

**File:** `monitoring/prometheus/alerts.yml`

```yaml
groups:
  - name: service_alerts
    interval: 30s
    rules:
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          description: "Service {{ $labels.job }} is down"
      
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          description: "High error rate on {{ $labels.job }}"
      
      - alert: HighMemoryUsage
        expr: (container_memory_usage_bytes / container_spec_memory_limit_bytes) > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          description: "Memory usage is above 90% on {{ $labels.container }}"
```

**File:** `docker-compose.yml` (add alertmanager)

```yaml
  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
    networks:
      - app-network
    restart: unless-stopped
```

**Update Prometheus config:**

```yaml
# monitoring/prometheus.yml
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - '/etc/prometheus/alerts.yml'
```

---

#### ✅ Task 6.4: Setup Telegram Bot

1. Tạo bot: Chat với @BotFather trên Telegram → `/newbot`
2. Lấy token: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`
3. Lấy chat ID: Chat với @userinfobot → copy Chat ID
4. Update `alertmanager.yml` với bot_token và chat_id

---

## 🎯 Ngày 7: Security & Optimization

### Mục tiêu
Secure hệ thống, giảm Docker image size, rate limiting.

### Tasks

#### ✅ Task 7.1: Trivy Security Scan

**Add to CI workflow:**

```yaml
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: ${{ secrets.DOCKER_USERNAME }}/user-auth-service:latest
        format: 'table'
        exit-code: '1'
        severity: 'CRITICAL,HIGH'
```

**Run locally:**

```bash
# Install Trivy
brew install trivy  # macOS
# or download from https://github.com/aquasecurity/trivy/releases

# Scan images
trivy image user-auth-service:latest
trivy image quiz-service:latest
```

---

#### ✅ Task 7.2: Optimize Docker Images

**Java Dockerfile (Multi-stage):**

```dockerfile
# Build stage
FROM maven:3.9.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

EXPOSE 8082
ENTRYPOINT ["java", "-jar", "-Xmx512m", "-Xms256m", "app.jar"]
```

**Go Dockerfile (Multi-stage):**

```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Run stage
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .

# Create non-root user
RUN adduser -D -u 1000 appuser
USER appuser

EXPOSE 8083
CMD ["./main"]
```

**Add .dockerignore:**

```
# Frontend
node_modules
.next
.git
*.md
.env.local

# Backend Java
target
.mvn
*.iml
.idea

# Backend Go
vendor
*.exe
*.test
*.prof
```

---

#### ✅ Task 7.3: Nginx Rate Limiting

**File:** `nginx/nginx.conf`

```nginx
http {
    # Rate limiting zone
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
    limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=10r/m;
    
    upstream user_auth_service {
        server user-auth-service:8082;
    }
    
    server {
        listen 80;
        
        # Rate limit for auth endpoints
        location /api/v1/auth/login {
            limit_req zone=auth_limit burst=5 nodelay;
            proxy_pass http://user_auth_service;
            # ... other proxy settings
        }
        
        # General API rate limit
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            # ... proxy settings
        }
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
    }
}
```

---

#### ✅ Task 7.4: HTTPS with Let's Encrypt (Optional)

**Nếu có domain:**

```yaml
  certbot:
    image: certbot/certbot
    container_name: certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
    networks:
      - app-network
```

**Update nginx config:**

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # ... rest of config
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

#### ✅ Task 7.5: Backup Script

**File:** `scripts/backup-db.sh`

```bash
#!/bin/bash

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="quiz_db_${DATE}.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup all databases
docker exec postgres pg_dumpall -U postgres > "$BACKUP_DIR/$FILENAME"

# Compress backup
gzip "$BACKUP_DIR/$FILENAME"

# Keep only last 7 days
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: ${FILENAME}.gz"
```

**Add to crontab:**

```bash
# Backup daily at 2am
0 2 * * * /path/to/scripts/backup-db.sh >> /var/log/db-backup.log 2>&1
```

---

## 📊 Verification Checklist

### Day 1: CI/CD
- [ ] GitHub Actions chạy thành công cho tất cả services
- [ ] Docker images được push lên DockerHub
- [ ] CI badge hiển thị trên README

### Day 2: Monitoring
- [ ] Prometheus UI accessible tại http://localhost:9090
- [ ] Grafana dashboard hiển thị metrics
- [ ] Có thể xem CPU, Memory, Request rate của mỗi service

### Day 3: Logging
- [ ] Loki accessible tại http://localhost:3100
- [ ] Có thể search logs trong Grafana Explore
- [ ] Query `{service="user-auth-service"}` trả về logs

### Day 4: API Docs
- [ ] Swagger UI accessible cho Java service
- [ ] Swagger UI accessible cho Go services
- [ ] Có thể test API trực tiếp từ Swagger UI

### Day 5: Database Migration
- [ ] Flyway migrations chạy tự động khi start Java service
- [ ] golang-migrate migrations có thể chạy manual
- [ ] Schema version được track trong DB

### Day 6: Health & Alerts
- [ ] `/health` endpoint trả về status của dependencies
- [ ] Docker health checks working
- [ ] Telegram bot nhận được test alert

### Day 7: Security
- [ ] Trivy scan không có CRITICAL vulnerabilities
- [ ] Docker images < 200MB (sau optimize)
- [ ] Nginx rate limiting hoạt động
- [ ] Backup script chạy thành công

---

## 🎉 Final Result

Sau 7 ngày, hệ thống sẽ có:

✅ **CI/CD**: Auto build & deploy
✅ **Monitoring**: Real-time dashboards
✅ **Logging**: Centralized search
✅ **Documentation**: Auto-generated API docs
✅ **Migration**: Version-controlled DB schema
✅ **Observability**: Health checks + Alerts
✅ **Security**: Vulnerability scanning + Rate limiting
✅ **Backup**: Automated daily backups

---

## 📚 Useful Links

- [Prometheus Docs](https://prometheus.io/docs/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- [Loki Query Language](https://grafana.com/docs/loki/latest/logql/)
- [SpringDoc OpenAPI](https://springdoc.org/)
- [Swaggo](https://github.com/swaggo/swag)
- [Flyway](https://flywaydb.org/documentation/)
- [golang-migrate](https://github.com/golang-migrate/migrate)
- [Trivy](https://aquasecurity.github.io/trivy/)

---

## 💡 Tips

- Làm từng ngày một, không nên vội
- Test kỹ mỗi bước trước khi sang bước tiếp
- Commit code sau mỗi task hoàn thành
- Tạo branch riêng cho mỗi feature
- Document lại những vấn đề gặp phải

---

**Good luck! 🚀**
