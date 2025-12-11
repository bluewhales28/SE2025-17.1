# Test Credentials for User Auth Service

## Sample User Accounts

All accounts use password: **password123**

### Admin Account
- **Email:** admin@quiz.com
- **Password:** password123
- **Role:** ADMIN
- **Full Name:** Admin User

### Creator/User Accounts
1. **Email:** teacher1@quiz.com
   - **Password:** password123
   - **Role:** USER
   - **Full Name:** Nguyen Van A

2. **Email:** teacher2@quiz.com
   - **Password:** password123
   - **Role:** USER
   - **Full Name:** Tran Thi B

### Student Accounts
1. **Email:** student1@quiz.com
   - **Password:** password123
   - **Role:** USER
   - **Full Name:** Le Hoang C

2. **Email:** student2@quiz.com
   - **Password:** password123
   - **Role:** USER
   - **Full Name:** Pham Thi D

3. **Email:** student3@quiz.com
   - **Password:** password123
   - **Role:** USER
   - **Full Name:** Hoang Van E

## Test User Accounts (Created During Testing)
- **Email:** freshuser@example.com
  - **Password:** password123
  - **Role:** USER

- **Email:** testuser123@example.com
  - **Password:** password123
  - **Role:** USER

## API Endpoints

### Login
```bash
curl -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@quiz.com","password":"password123"}'
```

### Registration
```bash
curl -X POST http://localhost/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@example.com",
    "password":"password123",
    "fullName":"New User",
    "phoneNumber":"0123456789",
    "dateOfBirth":"2000-01-01",
    "gender":"MALE",
    "role":"USER"
  }'
```

### Logout
```bash
curl -X POST http://localhost/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"token":"YOUR_TOKEN"}'
```

### Refresh Token
```bash
curl -X POST http://localhost/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN"}'
```

### Introspect Token
```bash
curl -X POST http://localhost/api/v1/auth/introspect \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN"}'
```

## Password Hash Details

All sample users use the same BCrypt hash for "password123":
```
$2a$10$uIUc5bo3gZIND8bRLFolceQVC2etSPWbD.rjNE8NIpOQQ6cUQBifO
```

This hash is generated using Spring Security's BCryptPasswordEncoder with default strength (10 rounds).

## Important Notes

1. **DTO Field Names Fixed:**
   - Changed `passwordHash` to `password` in AuthRequest.java
   - Changed `passwordHash` to `password` in UserRequest.java
   - Changed `passwordHash` to `password` in UpdateUserRequest.java
   - Updated all service methods to use `getPassword()` instead of `getPasswordHash()`

2. **Password Flow:**
   - Frontend sends raw password in `password` field
   - Backend receives it in DTO
   - PasswordService.hashPassword() converts to BCrypt
   - Stored as `password_hash` in User entity/database

3. **Authentication Flow:**
   - User sends email + password (raw)
   - Service fetches user by email
   - PasswordService.verifyPassword(rawPassword, hashedPassword)
   - BCryptPasswordEncoder.matches() validates
   - JWT token generated on success

## Fixed Issues

1. ✅ Changed AuthRequest field from `passwordHash` to `password`
2. ✅ Changed UserRequest field from `passwordHash` to `password`
3. ✅ Changed UpdateUserRequest field from `passwordHash` to `password`
4. ✅ Updated AuthenticationServiceImpl.authenticateUser() to use getPassword()
5. ✅ Updated UserServiceImpl.save() to use getPassword()
6. ✅ Updated UserServiceImpl update methods to use getPassword()
7. ✅ Updated init.sql with correct BCrypt hash for "password123"
8. ✅ Updated database with correct password hashes

## Status

✅ Login working for all accounts
✅ Registration working with correct field names
✅ Password hashing working correctly
✅ Frontend can now authenticate successfully
