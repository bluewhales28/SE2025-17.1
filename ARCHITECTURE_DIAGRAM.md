```mermaid
graph TB
    subgraph "Client Layer"
        FE[Frontend<br/>React/Next.js<br/>:3000]
        NGINX[Nginx<br/>API Gateway<br/>:80]
    end

    subgraph "Microservices Layer"
        AUTH[User Auth Service<br/>Spring Boot<br/>:8080]
        QUIZ[Quiz Service<br/>Go<br/>:8083]
        CLASS[Class Assignment<br/>Spring Boot<br/>:8081]
        NOTIF[Notification Service<br/>Go<br/>:8082]
        RECOM[Recommendation<br/>:8085]
        ANALY[Analytics<br/>:8084]
    end

    subgraph "Database Layer - Each Service Has Own DB"
        DB1[(user_auth_db<br/>PostgreSQL<br/>:5432)]
        DB2[(quiz_db<br/>PostgreSQL<br/>:5433)]
        DB3[(class_db<br/>PostgreSQL<br/>:5434)]
        DB4[(notification_db<br/>PostgreSQL<br/>:5435)]
        DB5[(recommendation_db<br/>PostgreSQL<br/>:5436)]
        DB6[(analytics_db<br/>PostgreSQL<br/>:5437)]
    end

    subgraph "Infrastructure Layer"
        REDIS[Redis<br/>Cache<br/>:6379]
        RABBIT[RabbitMQ<br/>Message Queue<br/>:5672]
    end

    FE -->|HTTP| NGINX
    NGINX -->|Route /auth| AUTH
    NGINX -->|Route /quiz| QUIZ
    NGINX -->|Route /class| CLASS
    NGINX -->|Route /notif| NOTIF
    NGINX -->|Route /recommend| RECOM
    NGINX -->|Route /analytics| ANALY

    AUTH -->|Owns| DB1
    QUIZ -->|Owns| DB2
    CLASS -->|Owns| DB3
    NOTIF -->|Owns| DB4
    RECOM -->|Owns| DB5
    ANALY -->|Owns| DB6

    AUTH -.->|REST API| QUIZ
    AUTH -.->|REST API| CLASS
    AUTH -.->|REST API| NOTIF
    QUIZ -.->|REST API| AUTH
    QUIZ -.->|REST API| NOTIF
    CLASS -.->|REST API| AUTH
    CLASS -.->|REST API| QUIZ
    CLASS -.->|REST API| NOTIF

    AUTH -->|Cache| REDIS
    QUIZ -->|Cache| REDIS
    RECOM -->|Cache| REDIS
    ANALY -->|Cache| REDIS

    QUIZ -->|Publish Events| RABBIT
    CLASS -->|Publish Events| RABBIT
    NOTIF -->|Consume Events| RABBIT
    ANALY -->|Consume Events| RABBIT

    classDef service fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff
    classDef database fill:#50C878,stroke:#2E7D4E,stroke-width:2px,color:#fff
    classDef infra fill:#F39C12,stroke:#C87F0A,stroke-width:2px,color:#fff
    classDef client fill:#9B59B6,stroke:#6C3483,stroke-width:2px,color:#fff

    class AUTH,QUIZ,CLASS,NOTIF,RECOM,ANALY service
    class DB1,DB2,DB3,DB4,DB5,DB6 database
    class REDIS,RABBIT infra
    class FE,NGINX client
```

# Architecture Diagram - Database per Service

## Legend

### 🔵 Microservices (Blue)
- Each service is independently deployable
- Own codebase and technology stack
- Communicates via REST APIs

### 🟢 Databases (Green)
- Each service has its own database
- **NO** cross-database queries
- **NO** foreign keys between services
- Independent scaling and backup

### 🟠 Infrastructure (Orange)
- **Redis**: Shared caching layer
- **RabbitMQ**: Asynchronous messaging

### 🟣 Client Layer (Purple)
- **Frontend**: User interface
- **Nginx**: API Gateway & reverse proxy

## Communication Patterns

### Solid Lines (→)
- Direct ownership
- Service → Database connection

### Dashed Lines (⤏)
- REST API calls between services
- Event publishing/consuming
- Caching

## Key Principles

### ✅ Database per Service
Each microservice owns its database completely:
- `user-auth-service` → `user_auth_db`
- `quiz-service` → `quiz_db`
- `class-assignment-service` → `class_db`
- `notification-service` → `notification_db`
- `recommendation-service` → `recommendation_db`
- `analytics-service` → `analytics_db`

### ✅ Loose Coupling
Services communicate via:
1. **Synchronous**: REST API calls
2. **Asynchronous**: RabbitMQ events
3. **Caching**: Redis for performance

### ✅ Data Consistency
- **SAGA Pattern**: Distributed transactions
- **Event Sourcing**: Audit trail
- **Eventual Consistency**: Via events

## Benefits

### Scalability
- Scale databases independently
- Scale services independently
- Different DB engines possible

### Resilience
- Fault isolation
- No single point of failure
- Independent deployment

### Development
- Team autonomy
- Technology flexibility
- Parallel development

### Security
- Database isolation
- Separate credentials
- Better access control
