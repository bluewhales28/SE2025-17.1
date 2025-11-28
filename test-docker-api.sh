#!/bin/bash

echo "1. Testing Registration..."
# Note: passwordHash is the field name in UserRequest, not password
curl -X POST http://localhost/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "docker_test_user@example.com",
    "passwordHash": "password123",
    "fullName": "Docker Test User",
    "phoneNumber": "0987654321",
    "dateOfBirth": "1990-01-01",
    "gender": "MALE",
    "role": "USER"
  }'

echo -e "\n\n2. Testing Login..."
# Note: passwordHash is the field name in AuthRequest too
curl -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "docker_test_user@example.com",
    "passwordHash": "password123"
  }'
