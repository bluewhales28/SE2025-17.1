# Notification Service

A microservice for managing notifications across multiple channels (email, in-app, push notifications) using Go and Gin framework.

## Features

- **Multi-channel Notifications**: Support for email, in-app, and push notifications
- **Event-driven Architecture**: Consumes events from RabbitMQ queue
- **Template System**: Dynamic email templates with Go template engine
- **User Preferences**: Customize notification settings per channel
- **Worker Pool**: Concurrent notification processing with configurable workers
- **Batch Processing**: Send multiple notifications efficiently
- **Retry Logic**: Automatic retry for failed notifications
- **RESTful API**: Complete REST API using Gin framework
- **Database**: PostgreSQL with GORM ORM

## Project Structure

```
notification-service/
├── config/           # Configuration and database setup
├── models/          # Data models (Notification, Preference, Template, Event)
├── services/        # Business logic (Email, Queue, Worker, etc.)
├── handlers/        # HTTP handlers for Gin routes
├── main.go          # Application entry point
├── Dockerfile       # Docker containerization
├── go.mod           # Go module dependencies
└── .env.example     # Environment variables template
```

## API Endpoints

### Notifications
- `POST /notifications` - Create notification
- `GET /notifications/:user_id` - Get user notifications (paginated)
- `GET /notifications/:id` - Get single notification
- `PUT /notifications/:id/read` - Mark as read
- `PUT /notifications/:id/archive` - Archive notification
- `DELETE /notifications/:id` - Delete notification
- `GET /notifications/:user_id/unread/count` - Get unread count

### Preferences
- `PUT /preferences/:user_id` - Update notification preferences
- `GET /preferences/:user_id` - Get all user preferences
- `GET /preferences/:user_id/:channel` - Get channel-specific preference
- `DELETE /preferences/:user_id/:channel` - Delete preference

### Templates
- `POST /templates` - Create email template
- `GET /templates` - List all templates
- `GET /templates/:id` - Get template by ID
- `GET /templates/name/:name` - Get template by name
- `PUT /templates/:id` - Update template
- `DELETE /templates/:id` - Delete template

## Setup

### Prerequisites
- Go 1.21+
- PostgreSQL 12+
- RabbitMQ 3.8+

### Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=notification_db

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672/

# Email Configuration
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Server
PORT=8080
ENV=development
```

### Installation

```bash
# Install dependencies
go mod download

# Run tests
go test ./...

# Build
go build -o notification-service .

# Run
./notification-service
```

## Docker

### Build Image

```bash
docker build -t notification-service:latest .
```

### Run Container

```bash
docker run -p 8080:8080 \
  -e DB_HOST=postgres \
  -e RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/ \
  -e SMTP_USER=your@email.com \
  -e SMTP_PASSWORD=password \
  notification-service:latest
```

## Database Schema

### notifications
- id: Primary key
- user_id: User identifier
- type: Notification type (e.g., "quiz_assigned")
- title: Notification title
- content: Notification content
- channel: Delivery channel (email, push, in_app)
- is_read: Read status
- status: Processing status (pending, sent, failed, archived)
- metadata: Custom JSON data
- created_at, updated_at: Timestamps

### preferences
- id: Primary key
- user_id: User identifier
- channel: Notification channel
- enabled: Whether notifications are enabled
- frequency: Delivery frequency (immediate, daily, weekly)
- updated_at: Last updated timestamp

### templates
- id: Primary key
- name: Template name (e.g., "quiz_assigned")
- subject: Email subject template
- body_html: HTML email body template
- body_text: Plain text email body
- channel: Target channel
- created_at, updated_at: Timestamps

## Development

### Running Tests

```bash
# All tests
go test ./...

# With coverage
go test -v -coverprofile=coverage.out ./...

# Specific test
go test -run TestRenderTemplate ./services
```

### Code Structure

- **models/models.go**: Data models with GORM tags
- **config/config.go**: Configuration management and database connection
- **services/email.go**: Email sending with template rendering
- **services/queue.go**: RabbitMQ consumer for event handling
- **services/worker.go**: Worker pool for concurrent processing
- **handlers/**: HTTP request handlers grouped by feature

## CI/CD

GitHub Actions workflow automatically:
1. Runs unit tests on push
2. Builds Docker image
3. Pushes to Docker Hub/Registry
4. Uploads coverage reports

Triggered on pushes to main/dev branches when notification-service files change.

## Future Enhancements

- FCM (Firebase Cloud Messaging) for push notifications
- WebSocket support for real-time notifications
- Rate limiting and throttling
- Notification aggregation/grouping
- Advanced scheduling
- Notification history/audit trail
