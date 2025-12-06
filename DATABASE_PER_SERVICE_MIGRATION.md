# Database Per Service Migration Guide

## 📋 Tổng quan

Hệ thống hiện tại đang vi phạm nguyên tắc **Database per Service** của kiến trúc Microservices. Document này hướng dẫn migration từ shared database sang database riêng cho từng service.

## ❌ Vấn đề hiện tại

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
- ❌ Không thể dùng database engines khác nhau
- ❌ Transaction boundaries không rõ ràng

## ✅ Kiến trúc mới

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│ Auth DB  │      │ Quiz DB  │      │ Class DB │      │Notif DB  │
│PostgreSQL│      │PostgreSQL│      │PostgreSQL│      │PostgreSQL│
└────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘
     │                 │                  │                  │
     ↓                 ↓                  ↓                  ↓
┌─────────┐      ┌──────────┐      ┌───────────┐    ┌──────────┐
│  Auth   │      │   Quiz   │      │   Class   │    │  Notif   │
│ Service │◄────►│  Service │◄────►│  Service  │◄──►│ Service  │
└─────────┘      └──────────┘      └───────────┘    └──────────┘
    (API calls thay vì foreign keys)
```

## 📊 Phân chia Database Schema

### 1. User Auth Service Database (`user_auth_db`)

**Tables:**
- `users` - User accounts
- `invalid_tokens` - Blacklisted tokens
- `password_reset_tokens` - Password reset requests
- `user_roles` - User role assignments
- `role_permissions` - Role-based permissions

**Port:** 5432 (internal: user-auth-db:5432)

---

### 2. Quiz Service Database (`quiz_db`)

**Tables:**
- `quizzes` - Quiz definitions
- `questions` - Quiz questions
- `question_options` - Multiple choice options
- `attempts` - Quiz attempt records
- `attempt_answers` - Student answers
- `quiz_analytics` - Quiz performance metrics

**Removed Foreign Keys:**
- `quiz.created_by_user_id` → Call Auth API để validate
- `attempts.student_id` → Call Auth API để get user info

**Port:** 5433 (internal: quiz-db:5432)

---

### 3. Class Assignment Service Database (`class_db`)

**Tables:**
- `classes` - Class definitions
- `class_members` - Student enrollments
- `assignments` - Assignment definitions
- `student_progress` - Assignment progress tracking
- `submissions` - Assignment submissions
- `grades` - Grading records

**Removed Foreign Keys:**
- `class.teacher_id` → Call Auth API
- `class_members.user_id` → Call Auth API
- `assignments.quiz_id` → Call Quiz API

**Port:** 5434 (internal: class-db:5432)

---

### 4. Notification Service Database (`notification_db`)

**Tables:**
- `notification_templates` - Email/push templates
- `notification_queue` - Pending notifications
- `notification_history` - Sent notification logs
- `user_preferences` - User notification settings
- `notification_analytics` - Delivery metrics

**Removed Foreign Keys:**
- `notification_history.user_id` → Store as plain value
- `notification_queue.target_user_id` → Store as plain value

**Port:** 5435 (internal: notification-db:5432)

---

### 5. Recommendation Service Database (`recommendation_db`)

**Tables:**
- `user_learning_profiles` - Học viên learning patterns
- `quiz_recommendations` - Đề xuất quiz
- `skill_assessments` - Đánh giá kỹ năng
- `learning_paths` - Lộ trình học tập được gợi ý
- `recommendation_logs` - Log các đề xuất đã tạo

**Port:** 5436 (internal: recommendation-db:5432)

---

### 6. Analytics Service Database (`analytics_db`)

**Tables:**
- `user_activity_logs` - Logs hoạt động người dùng
- `quiz_performance_metrics` - Metrics hiệu suất quiz
- `class_engagement_stats` - Thống kê engagement lớp học
- `system_usage_stats` - Thống kê sử dụng hệ thống
- `report_snapshots` - Snapshot reports theo thời gian

**Port:** 5437 (internal: analytics-db:5432)

---

## 🔄 Xử lý Cross-Service Data Access

### Pattern 1: API Calls (Synchronous)

```java
// Class Service cần user info
@Service
public class ClassService {
    @Autowired
    private RestTemplate restTemplate;
    
    public ClassDTO createClass(CreateClassRequest request) {
        // Validate teacher exists via API call
        UserDTO teacher = restTemplate.getForObject(
            "http://user-auth-service/api/users/" + request.getTeacherId(),
            UserDTO.class
        );
        
        if (teacher == null) {
            throw new UserNotFoundException();
        }
        
        // Store only teacher_id, not foreign key
        Class classEntity = new Class();
        classEntity.setTeacherId(request.getTeacherId());
        return classRepository.save(classEntity);
    }
}
```

### Pattern 2: Event-Driven (Asynchronous)

```go
// Quiz Service publishes event khi quiz completed
type QuizCompletedEvent struct {
    QuizID    int     `json:"quiz_id"`
    StudentID int     `json:"student_id"`
    Score     float64 `json:"score"`
    Timestamp time.Time `json:"timestamp"`
}

// Publish to message queue
func (s *QuizService) CompleteQuiz(attempt *Attempt) error {
    // Save to quiz_db
    s.repo.SaveAttempt(attempt)
    
    // Publish event
    event := QuizCompletedEvent{
        QuizID:    attempt.QuizID,
        StudentID: attempt.StudentID,
        Score:     attempt.Score,
        Timestamp: time.Now(),
    }
    s.messageQueue.Publish("quiz.completed", event)
    return nil
}

// Analytics Service consumes event
func (s *AnalyticsService) HandleQuizCompleted(event QuizCompletedEvent) {
    // Save to analytics_db
    s.repo.RecordQuizCompletion(event)
}
```

### Pattern 3: Data Duplication (Caching)

```java
// Class Service caches basic user info
@Entity
@Table(name = "cached_users")
public class CachedUser {
    @Id
    private Long userId;
    private String username;
    private String email;
    private LocalDateTime lastUpdated;
    private LocalDateTime cacheExpiry;
}

// Update cache khi nhận event từ Auth Service
@KafkaListener(topics = "user.updated")
public void onUserUpdated(UserUpdatedEvent event) {
    CachedUser cached = new CachedUser();
    cached.setUserId(event.getUserId());
    cached.setUsername(event.getUsername());
    cached.setEmail(event.getEmail());
    cached.setLastUpdated(LocalDateTime.now());
    cached.setCacheExpiry(LocalDateTime.now().plusHours(24));
    cachedUserRepository.save(cached);
}
```

---

## 🚀 Migration Steps

### Step 1: Backup hiện tại

```bash
# Backup toàn bộ database hiện tại
docker exec postgres-db pg_dump -U admin quizz > backup_before_migration.sql
```

### Step 2: Tạo schema files riêng

```bash
backend/user-auth-service/schema/
├── init.sql          # Schema cho user_auth_db
└── seed.sql          # Test data

backend/quiz-service/db/
├── schema.sql        # Schema cho quiz_db
└── seed.sql

backend/class-assignment-service/schema/
├── init.sql          # Schema cho class_db
└── seed.sql

backend/notification-service/schema/
├── init.sql          # Schema cho notification_db
└── seed.sql
```

### Step 3: Update Docker Compose

```bash
# File mới: docker-compose.databases.yml
# Chứa tất cả database containers riêng biệt
```

### Step 4: Update Service Configurations

```bash
# Update connection strings trong:
- backend/user-auth-service/src/main/resources/application.yml
- backend/quiz-service/config/config.go
- backend/class-assignment-service/src/main/resources/application.yml
- backend/notification-service/config/config.go
```

### Step 5: Implement Inter-Service Communication

```bash
# Thêm REST clients/HTTP libraries
- Spring Cloud OpenFeign (Java services)
- Go HTTP client (Go services)
- Circuit breakers (Resilience4j)
```

### Step 6: Data Migration Scripts

```bash
# Scripts để migrate data từ shared DB sang individual DBs
migration/
├── migrate_users.sql
├── migrate_quizzes.sql
├── migrate_classes.sql
└── migrate_notifications.sql
```

### Step 7: Testing

```bash
# Test từng service với DB riêng
docker-compose -f docker-compose.databases.yml up -d
docker-compose up user-auth-service
docker-compose up quiz-service
# ... test each service
```

---

## 📝 Configuration Examples

### Docker Compose (Databases)

```yaml
version: '3.8'

services:
  # ===== USER AUTH DATABASE =====
  user-auth-db:
    image: postgres:15-alpine
    container_name: user-auth-db
    environment:
      POSTGRES_DB: user_auth_db
      POSTGRES_USER: auth_user
      POSTGRES_PASSWORD: ${AUTH_DB_PASSWORD:-auth_pass_secure_123}
    ports:
      - "5432:5432"
    volumes:
      - user_auth_data:/var/lib/postgresql/data
      - ./backend/user-auth-service/schema:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U auth_user -d user_auth_db"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - microservices-network

  # ===== QUIZ DATABASE =====
  quiz-db:
    image: postgres:15-alpine
    container_name: quiz-db
    environment:
      POSTGRES_DB: quiz_db
      POSTGRES_USER: quiz_user
      POSTGRES_PASSWORD: ${QUIZ_DB_PASSWORD:-quiz_pass_secure_123}
    ports:
      - "5433:5432"
    volumes:
      - quiz_data:/var/lib/postgresql/data
      - ./backend/quiz-service/db/schema.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U quiz_user -d quiz_db"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - microservices-network

  # ===== CLASS ASSIGNMENT DATABASE =====
  class-db:
    image: postgres:15-alpine
    container_name: class-db
    environment:
      POSTGRES_DB: class_db
      POSTGRES_USER: class_user
      POSTGRES_PASSWORD: ${CLASS_DB_PASSWORD:-class_pass_secure_123}
    ports:
      - "5434:5432"
    volumes:
      - class_data:/var/lib/postgresql/data
      - ./backend/class-assignment-service/schema:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U class_user -d class_db"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - microservices-network

  # ===== NOTIFICATION DATABASE =====
  notification-db:
    image: postgres:15-alpine
    container_name: notification-db
    environment:
      POSTGRES_DB: notification_db
      POSTGRES_USER: notif_user
      POSTGRES_PASSWORD: ${NOTIF_DB_PASSWORD:-notif_pass_secure_123}
    ports:
      - "5435:5432"
    volumes:
      - notification_data:/var/lib/postgresql/data
      - ./backend/notification-service/schema:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U notif_user -d notification_db"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - microservices-network

  # ===== RECOMMENDATION DATABASE =====
  recommendation-db:
    image: postgres:15-alpine
    container_name: recommendation-db
    environment:
      POSTGRES_DB: recommendation_db
      POSTGRES_USER: recommendation_user
      POSTGRES_PASSWORD: ${RECOMMENDATION_DB_PASSWORD:-recommendation_pass_secure_123}
    ports:
      - "5436:5432"
    volumes:
      - recommendation_data:/var/lib/postgresql/data
      - ./backend/recommendation-service/schema:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U recommendation_user -d recommendation_db"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - microservices-network

  # ===== ANALYTICS DATABASE =====
  analytics-db:
    image: postgres:15-alpine
    container_name: analytics-db
    environment:
      POSTGRES_DB: analytics_db
      POSTGRES_USER: analytics_user
      POSTGRES_PASSWORD: ${ANALYTICS_DB_PASSWORD:-analytics_pass_secure_123}
    ports:
      - "5437:5432"
    volumes:
      - analytics_data:/var/lib/postgresql/data
      - ./backend/analytics-statistic-service/schema:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U analytics_user -d analytics_db"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - microservices-network

volumes:
  user_auth_data:
  quiz_data:
  class_data:
  notification_data:
  recommendation_data:
  analytics_data:

networks:
  microservices-network:
    driver: bridge
```

### Spring Boot Configuration (User Auth Service)

```yaml
# application.yml
spring:
  application:
    name: user-auth-service
  
  datasource:
    url: jdbc:postgresql://${DB_HOST:user-auth-db}:${DB_PORT:5432}/${DB_NAME:user_auth_db}
    username: ${DB_USER:auth_user}
    password: ${DB_PASSWORD:auth_pass_secure_123}
    driver-class-name: org.postgresql.Driver
    
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true

# Service discovery
eureka:
  client:
    service-url:
      defaultZone: http://discovery-service:8761/eureka/
```

### Go Configuration (Quiz Service)

```go
// config/config.go
package config

import (
    "fmt"
    "os"
)

type Config struct {
    Database DatabaseConfig
    Services ServiceURLs
}

type DatabaseConfig struct {
    Host     string
    Port     string
    User     string
    Password string
    DBName   string
    SSLMode  string
}

type ServiceURLs struct {
    AuthService  string
    ClassService string
    NotifService string
}

func Load() *Config {
    return &Config{
        Database: DatabaseConfig{
            Host:     getEnv("DB_HOST", "quiz-db"),
            Port:     getEnv("DB_PORT", "5432"),
            User:     getEnv("DB_USER", "quiz_user"),
            Password: getEnv("DB_PASSWORD", "quiz_pass_secure_123"),
            DBName:   getEnv("DB_NAME", "quiz_db"),
            SSLMode:  getEnv("DB_SSLMODE", "disable"),
        },
        Services: ServiceURLs{
            AuthService:  getEnv("AUTH_SERVICE_URL", "http://user-auth-service:8080"),
            ClassService: getEnv("CLASS_SERVICE_URL", "http://class-assignment-service:8081"),
            NotifService: getEnv("NOTIF_SERVICE_URL", "http://notification-service:8082"),
        },
    }
}

func (c *DatabaseConfig) ConnectionString() string {
    return fmt.Sprintf(
        "host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
        c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode,
    )
}

func getEnv(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}
```

---

## 🔒 Transaction Management

### SAGA Pattern cho Distributed Transactions

```java
// Example: Tạo assignment mới (cần quiz + class validation)

@Service
public class AssignmentSagaOrchestrator {
    
    @Autowired
    private QuizServiceClient quizClient;
    
    @Autowired
    private ClassServiceClient classClient;
    
    @Autowired
    private AssignmentRepository assignmentRepo;
    
    @Transactional
    public AssignmentDTO createAssignment(CreateAssignmentRequest request) {
        // Step 1: Validate quiz exists
        QuizDTO quiz = quizClient.getQuiz(request.getQuizId());
        if (quiz == null) {
            throw new QuizNotFoundException();
        }
        
        // Step 2: Validate class exists
        ClassDTO classDto = classClient.getClass(request.getClassId());
        if (classDto == null) {
            // Compensating action: None needed (read-only)
            throw new ClassNotFoundException();
        }
        
        // Step 3: Create assignment in local DB
        Assignment assignment = new Assignment();
        assignment.setQuizId(request.getQuizId());
        assignment.setClassId(request.getClassId());
        assignment.setDeadline(request.getDeadline());
        
        try {
            assignment = assignmentRepo.save(assignment);
        } catch (Exception e) {
            // Compensating action: Rollback local transaction
            throw new AssignmentCreationFailedException(e);
        }
        
        // Step 4: Notify students (async)
        try {
            notificationClient.sendAssignmentNotification(assignment.getId());
        } catch (Exception e) {
            // Log error but don't rollback
            log.error("Failed to send notifications", e);
        }
        
        return AssignmentDTO.from(assignment);
    }
}
```

---

## 📈 Monitoring & Health Checks

### Database Health Endpoints

```java
// Spring Boot Actuator
@Component
public class DatabaseHealthIndicator implements HealthIndicator {
    
    @Autowired
    private DataSource dataSource;
    
    @Override
    public Health health() {
        try (Connection conn = dataSource.getConnection()) {
            if (conn.isValid(2)) {
                return Health.up()
                    .withDetail("database", "user_auth_db")
                    .withDetail("status", "connected")
                    .build();
            }
        } catch (Exception e) {
            return Health.down()
                .withDetail("database", "user_auth_db")
                .withDetail("error", e.getMessage())
                .build();
        }
        return Health.down().build();
    }
}
```

### Prometheus Metrics

```yaml
# Each database exports metrics
- name: pg_exporter_auth_db
  image: prometheuscommunity/postgres-exporter
  environment:
    DATA_SOURCE_NAME: "postgresql://auth_user:auth_pass@user-auth-db:5432/user_auth_db?sslmode=disable"
```

---

## ⚡ Performance Considerations

### Connection Pooling

```yaml
# Spring Boot HikariCP
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

### Caching Strategy

```java
@Cacheable(value = "users", key = "#userId")
public UserDTO getUserById(Long userId) {
    // Call auth service API
    return restTemplate.getForObject(
        authServiceUrl + "/users/" + userId,
        UserDTO.class
    );
}
```

---

## 🧪 Testing Strategy

### Integration Tests với Testcontainers

```java
@SpringBootTest
@Testcontainers
public class ClassServiceIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
        .withDatabaseName("class_db_test")
        .withUsername("test_user")
        .withPassword("test_pass");
    
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }
    
    @Test
    void testCreateClass() {
        // Mock auth service response
        // Test với isolated database
    }
}
```

---

## 📚 Best Practices

### ✅ DO's

1. **Mỗi service chỉ access database của chính nó**
2. **Dùng API calls cho cross-service data**
3. **Implement circuit breakers cho resilience**
4. **Cache frequently accessed data**
5. **Use async messaging cho non-critical operations**
6. **Version your database schemas**
7. **Implement proper monitoring**

### ❌ DON'Ts

1. **KHÔNG dùng distributed transactions (2PC)**
2. **KHÔNG share database credentials**
3. **KHÔNG join tables across services**
4. **KHÔNG expose internal IDs externally**
5. **KHÔNG synchronous calls trong critical path nếu có thể**

---

## 🎯 Rollback Plan

Nếu migration gặp vấn đề:

```bash
# 1. Stop new services
docker-compose down

# 2. Restore shared database
docker exec -i postgres-db psql -U admin quizz < backup_before_migration.sql

# 3. Revert to old docker-compose
git checkout docker-compose.yml.backup
docker-compose up -d

# 4. Verify system health
./test-integration.sh
```

---

## ✅ Migration Checklist

- [ ] Backup current database
- [ ] Create schema files for each service
- [ ] Update docker-compose with separate databases
- [ ] Implement inter-service communication
- [ ] Add circuit breakers & retries
- [ ] Implement caching layer
- [ ] Update service configurations
- [ ] Write data migration scripts
- [ ] Test each service independently
- [ ] Test inter-service communication
- [ ] Load testing
- [ ] Update monitoring & alerting
- [ ] Document API contracts
- [ ] Train team on new architecture
- [ ] Deploy to staging
- [ ] Deploy to production

---

## 📖 References

- [Microservices Pattern: Database per Service](https://microservices.io/patterns/data/database-per-service.html)
- [SAGA Pattern](https://microservices.io/patterns/data/saga.html)
- [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)

---

**Status:** 🚧 Ready for Implementation  
**Estimated Time:** 2-3 weeks  
**Priority:** High  
**Last Updated:** December 5, 2025
