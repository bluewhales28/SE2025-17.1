# User Auth Service - API Test Guide

## Prerequisites

- PostgreSQL running on localhost:5432 with database `quizz` created
- Password: `123456`
- The service should be running on `http://localhost:8080`

## Database Setup

Database and tables will be created automatically when the service starts (Hibernate ddl-auto: update).
ddd
## API Endpoints Testing

### 1. Register a New User

```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "passwordHash": "password123",
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0987654321",
    "dateOfBirth": "1990-01-15",
    "gender": "MALE",
    "role": "USER"
  }'
```

Expected Response (201 Created):
```json
{
  "status": 201,
  "message": "Register successful",
  "data": {
    "id": 1,
    "email": "user1@example.com",
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0987654321",
    "dateOfBirth": "1990-01-15",
    "gender": "MALE",
    "isEmailVerified": true,
    "role": "USER",
    "createdAt": "2025-11-17T23:00:00Z",
    "updatedAt": "2025-11-17T23:00:00Z"
  }
}
```

### 2. Login User

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "passwordHash": "password123"
  }'
```

Expected Response (200 OK):
```json
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "authenticated": true
  }
}
```

Save the token for use in authenticated requests:
```bash
TOKEN="eyJhbGciOiJIUzUxMiJ9..."
```

### 3. Get User Profile (Authenticated)

```bash
curl -X GET http://localhost:8080/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

Expected Response (200 OK):
```json
{
  "status": 200,
  "message": "Get profile successful",
  "data": {
    "id": 1,
    "email": "user1@example.com",
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0987654321",
    "dateOfBirth": "1990-01-15",
    "gender": "MALE",
    "isEmailVerified": true,
    "role": "USER"
  }
}
```

### 4. Update User Profile (Authenticated)

```bash
curl -X PUT http://localhost:8080/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nguyễn Văn A Updated",
    "phoneNumber": "0912345678",
    "dateOfBirth": "1990-01-15",
    "gender": "MALE"
  }'
```

Expected Response (200 OK):
```json
{
  "status": 200,
  "message": "Update profile successful",
  "data": {
    "id": 1,
    "email": "user1@example.com",
    "fullName": "Nguyễn Văn A Updated",
    "phoneNumber": "0912345678",
    "dateOfBirth": "1990-01-15",
    "gender": "MALE",
    "isEmailVerified": true,
    "role": "USER"
  }
}
```

### 5. Search Users by Name

```bash
curl -X GET "http://localhost:8080/users?fullName=Nguyễn&page=1&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

Expected Response (200 OK):
```json
{
  "status": 200,
  "message": "Get users successful",
  "data": {
    "items": [
      {
        "id": 1,
        "email": "user1@example.com",
        "fullName": "Nguyễn Văn A Updated",
        "phoneNumber": "0912345678",
        "gender": "MALE",
        "role": "USER"
      }
    ],
    "currentPage": 1,
    "pageSize": 10,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

### 6. Refresh Token

```bash
curl -X POST http://localhost:8080/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzUxMiJ9..."
  }'
```

Expected Response (200 OK):
```json
{
  "status": 200,
  "message": "Refresh token successful",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...(new token)",
    "authenticated": true
  }
}
```

### 7. Introspect Token (Check Validity)

```bash
curl -X POST http://localhost:8080/auth/introspect \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzUxMiJ9..."
  }'
```

Expected Response (200 OK):
```json
{
  "status": 200,
  "message": "Introspect token successful",
  "data": {
    "valid": true
  }
}
```

Or if token is invalid:
```json
{
  "status": 200,
  "message": "Introspect token successful",
  "data": {
    "valid": false
  }
}
```

### 8. Logout User

```bash
curl -X POST http://localhost:8080/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzUxMiJ9..."
  }'
```

Expected Response (200 OK):
```json
{
  "status": 200,
  "message": "Logout successful"
}
```

After logout, the token will be invalid.

### 9. Get All Users (Admin Only)

```bash
# First create an admin user
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "passwordHash": "adminpass123",
    "fullName": "Admin User",
    "phoneNumber": "0909090909",
    "gender": "MALE",
    "role": "ADMIN"
  }'

# Login as admin
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "passwordHash": "adminpass123"
  }'

# Get all users with admin token
curl -X GET "http://localhost:8080/users/all?page=1&size=10&sortBy=createdAt" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected Response (200 OK):
```json
{
  "status": 200,
  "message": "Get users successful",
  "data": {
    "items": [
      {
        "id": 1,
        "email": "user1@example.com",
        "fullName": "Nguyễn Văn A Updated",
        "gender": "MALE",
        "role": "USER",
        "createdAt": "2025-11-17T23:00:00Z"
      },
      {
        "id": 2,
        "email": "admin@example.com",
        "fullName": "Admin User",
        "gender": "MALE",
        "role": "ADMIN",
        "createdAt": "2025-11-17T23:05:00Z"
      }
    ],
    "currentPage": 1,
    "pageSize": 10,
    "totalElements": 2,
    "totalPages": 1
  }
}
```

### 10. Update User by ID (Admin)

```bash
curl -X PUT http://localhost:8080/users/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nguyễn Văn A Final Update",
    "phoneNumber": "0913131313",
    "gender": "MALE"
  }'
```

## Error Handling

### Validation Error (400 Bad Request)
```json
{
  "status": 400,
  "message": "Email already exists",
  "errors": [
    "Email must be unique"
  ]
}
```

### Unauthorized (401)
```json
{
  "status": 401,
  "message": "Unauthorized",
  "errors": [
    "Invalid token or token expired"
  ]
}
```

### Forbidden (403)
```json
{
  "status": 403,
  "message": "Forbidden",
  "errors": [
    "You do not have permission to access this resource"
  ]
}
```

### Not Found (404)
```json
{
  "status": 404,
  "message": "User not found"
}
```

## Database Schema

The service will automatically create the following tables:

### users table
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    is_email_verified BOOLEAN NOT NULL DEFAULT true,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### invalid_tokens table
```sql
CREATE TABLE invalid_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(1000) UNIQUE NOT NULL,
    expiration_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Security Notes

- All passwords are hashed using BCrypt
- JWT tokens expire after 24 hours
- Tokens are blacklisted on logout
- Access control is role-based (USER vs ADMIN)
- Use HTTPS in production

## Test Sequence

1. Register 2 regular users (user1, user2)
2. Register 1 admin user
3. Login each user and get tokens
4. Test profile endpoints (get, update)
5. Search users with pagination
6. Test refresh token
7. Test introspect endpoint
8. Logout and verify token is invalid
9. Test admin endpoints with admin token
10. Try accessing admin endpoints with regular user token (should fail)
