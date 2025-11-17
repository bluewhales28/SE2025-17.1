# Auth Service & Notification Service Integration

## Overview

The User Authentication Service now integrates with the Notification Service to send automated notifications to users on important events.

## Architecture

```
┌─────────────────────────────────────────┐
│   User Auth Service (Port 8081)         │
│  ┌──────────────────────────────────┐   │
│  │  UserServiceImpl                  │   │
│  │  - User Registration             │   │
│  │  - Profile Update                │   │
│  │  - Authentication Events         │   │
│  └──────────────┬───────────────────┘   │
│                 │                        │
│  ┌──────────────▼───────────────────┐   │
│  │  NotificationClient              │   │
│  │  - sends HTTP requests           │   │
│  │  - integrates with notification  │   │
│  │    service API                   │   │
│  └──────────────┬───────────────────┘   │
└─────────────────┼────────────────────────┘
                  │ HTTP (REST)
                  │
┌─────────────────▼────────────────────────┐
│   Notification Service (Port 8080)       │
│  ┌──────────────────────────────────┐    │
│  │  POST /notifications             │    │
│  │  - Creates notifications         │    │
│  │  - Queues for processing         │    │
│  │  - Sends emails via SMTP         │    │
│  └──────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

## Integration Components

### 1. NotificationClient Service

**Location**: `src/main/java/com/quizapp/user_auth_service/service/NotificationClient.java`

Provides methods to send different types of notifications:

```java
// Send welcome notification on user registration
notificationClient.sendWelcomeNotification(userId, email, fullName);

// Send password reset notification
notificationClient.sendPasswordResetNotification(userId, email, fullName, resetToken);

// Send email verification notification
notificationClient.sendEmailVerificationNotification(userId, email, fullName, token);

// Send generic in-app notification
notificationClient.sendInAppNotification(userId, title, content);
```

### 2. AppConfig

**Location**: `src/main/java/com/quizapp/user_auth_service/config/AppConfig.java`

Provides Spring beans for HTTP communication:

```java
@Bean
public RestTemplate restTemplate(RestTemplateBuilder builder) {
    return builder
        .setConnectTimeout(5000)
        .setReadTimeout(10000)
        .build();
}

@Bean
public ObjectMapper objectMapper() {
    return new ObjectMapper();
}
```

### 3. Integration with UserServiceImpl

When users register or update their profile, notifications are automatically sent:

```java
// On user registration
@Override
public UserResponse save(UserRequest userRequest) {
    // ... save user ...
    user = userRepository.save(user);
    
    // Send welcome notification
    notificationClient.sendWelcomeNotification(user.getId(), user.getEmail(), user.getFullName());
    
    return userMapper.toUserReponse(user);
}

// On profile update
@Override
public UserResponse updateProfile(String email, UpdateUserRequest updateUserRequest) {
    // ... update user ...
    user = userRepository.save(user);
    
    // Send notification about update
    notificationClient.sendInAppNotification(user.getId(), 
        "Cập nhật hồ sơ", 
        "Hồ sơ của bạn đã được cập nhật thành công");
    
    return userMapper.toUserReponse(user);
}
```

## Configuration

### application.yml

```yaml
server:
  port: 8081

app:
  notification:
    service-url: http://localhost:8080
```

The `app.notification.service-url` is configurable and injected into the NotificationClient.

## Event Flow

### 1. User Registration Flow

```
1. User calls POST /users
   └─> UserServiceImpl.save()
       ├─> Save user to database
       ├─> Hash password
       └─> NotificationClient.sendWelcomeNotification()
           └─> HTTP POST http://localhost:8080/notifications
               └─> Notification Service processes and sends email
```

### 2. Profile Update Flow

```
1. User calls PUT /users/profile
   └─> UserServiceImpl.updateProfile()
       ├─> Update user in database
       └─> NotificationClient.sendInAppNotification()
           └─> HTTP POST http://localhost:8080/notifications
               └─> Notification Service creates in-app notification
```

## Notification Payloads

### Welcome Notification

```json
{
  "user_id": 1,
  "type": "welcome",
  "title": "Chào mừng đến QuizMaster",
  "content": "Cảm ơn bạn đã đăng ký tài khoản",
  "channel": "email",
  "metadata": {
    "recipient_email": "user@example.com",
    "UserName": "User Full Name"
  }
}
```

### Profile Update Notification

```json
{
  "user_id": 1,
  "type": "info",
  "title": "Cập nhật hồ sơ",
  "content": "Hồ sơ của bạn đã được cập nhật thành công",
  "channel": "in_app",
  "metadata": {}
}
```

### Password Reset Notification

```json
{
  "user_id": 1,
  "type": "reset_password",
  "title": "Đặt lại mật khẩu",
  "content": "Yêu cầu đặt lại mật khẩu của bạn",
  "channel": "email",
  "metadata": {
    "recipient_email": "user@example.com",
    "UserName": "User Full Name",
    "resetToken": "token_here"
  }
}
```

## Error Handling

The NotificationClient uses a non-blocking error handling approach:

```java
try {
    // Send notification
    sendNotification(notification);
    log.info("Notification sent successfully");
} catch (Exception e) {
    log.error("Failed to send notification", e);
    // Exception is NOT thrown - user request continues
}
```

This ensures that:
- User registration succeeds even if notification fails
- Profile updates complete regardless of notification service status
- Application remains responsive if notification service is temporarily unavailable

## Testing

### Start Both Services

```bash
# Terminal 1: Start Notification Service
cd backend/notification-service
go run main.go

# Terminal 2: Start Auth Service (once compilation issue is fixed)
cd backend/user-auth-service
./mvnw spring-boot:run
```

### Test User Registration (with notification)

```bash
curl -X POST http://localhost:8081/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "passwordHash": "password123",
    "fullName": "New User",
    "phoneNumber": "0123456789",
    "dateOfBirth": "1990-01-15",
    "gender": "MALE",
    "role": "USER"
  }'
```

Expected:
- User created in PostgreSQL database (quizz)
- Welcome notification sent to Notification Service
- Email should be created in notification_db (notification_service PostgreSQL)

### Test Profile Update (with in-app notification)

```bash
# First login
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "passwordHash": "password123"
  }'

# Then update profile
curl -X PUT http://localhost:8081/users/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated User",
    "phoneNumber": "0987654321",
    "dateOfBirth": "1990-01-15",
    "gender": "MALE"
  }'
```

Expected:
- User profile updated in database
- In-app notification created in notification service

## Future Extensions

### Planned Notifications

The infrastructure is ready to add more notification types:

- **Login notifications**: Notify user on successful login from new device
- **Password change notifications**: Confirm password updates
- **Email verification**: Send verification links
- **Quiz events**: Notify when new quizzes are assigned
- **Achievement notifications**: Notify on badge earning
- **Admin notifications**: Notify admins of important events

### Example Implementation

```java
// Send notification on successful login
public void sendLoginNotification(User user) {
    notificationClient.sendInAppNotification(user.getId(),
        "Đăng nhập thành công",
        "Bạn đã đăng nhập vào QuizMaster");
}

// Send notification on quiz assignment
public void sendQuizAssignmentNotification(Long userId, String quizName) {
    notificationClient.sendInAppNotification(userId,
        "Quiz được gán",
        "Quiz mới '" + quizName + "' đã được gán cho bạn");
}
```

## Database Details

### Auth Service Database (PostgreSQL quizz)
- Contains: users, invalid_tokens tables
- Used for: User authentication, session management

### Notification Service Database (PostgreSQL notification_db)
- Contains: notifications, templates, preferences, invalid_tokens tables
- Used for: Storing notifications, templates, user preferences

## Dependencies

### Auth Service
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>com.fasterxml.jackson.datatype</groupId>
    <artifactId>jackson-datatype-jsr310</artifactId>
</dependency>
```

### Notification Service
```go
import (
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)
```

## Monitoring

To monitor the integration, check logs for:

**Auth Service**:
```
NotificationClient: Welcome notification sent for user: user@example.com
NotificationClient: In-app notification sent for user: 1
```

**Notification Service**:
```
[Email] Processing notification ID=X, type=welcome
[Email] SUCCESS: Email sent to user@example.com
```

## Troubleshooting

### Issue: "Connection refused" on POST /notifications

**Solution**: Ensure notification service is running on port 8080

```bash
# Check if running
curl http://localhost:8080/health
```

### Issue: Notifications sent but not received

**Solution**: Check notification service logs and check email configuration

```bash
# Verify SMTP credentials in notification service .env file
grep SMTP backend/notification-service/.env
```

### Issue: User registration succeeds but no notification

**Solution**: Check auth service logs for NotificationClient errors

```bash
# Look for error messages
grep "NotificationClient" <auth-service-logs>
```

## Summary

The integration provides:
- ✅ Automatic welcome emails on registration
- ✅ In-app notifications for profile updates
- ✅ Non-blocking error handling
- ✅ Extensible notification system
- ✅ Separate concerns (Auth and Notifications)
- ✅ Easy to add more notification types
