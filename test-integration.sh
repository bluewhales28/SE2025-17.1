#!/bin/bash

BASE_URL="http://localhost/api/v1"
CONTENT_TYPE="Content-Type: application/json"

echo "----------------------------------------------------------------"
echo "Starting Integration Test for All Services"
echo "----------------------------------------------------------------"

# 1. User Auth Service: Register
echo -e "\n[1] Testing User Registration..."
REGISTER_PAYLOAD='{
  "email": "integration_test_user_'$(date +%s)'@example.com",
  "passwordHash": "password123",
  "fullName": "Integration Test User",
  "phoneNumber": "0987654321",
  "dateOfBirth": "1995-05-05",
  "gender": "MALE",
  "role": "USER"
}'
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/users" -H "$CONTENT_TYPE" -d "$REGISTER_PAYLOAD")
echo "Response: $REGISTER_RESPONSE"

# Extract Email for Login
EMAIL=$(echo $REGISTER_PAYLOAD | grep -oP '"email": "\K[^"]+')

# 2. User Auth Service: Login
echo -e "\n[2] Testing User Login..."
LOGIN_PAYLOAD='{
  "email": "'$EMAIL'",
  "passwordHash": "password123"
}'
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" -H "$CONTENT_TYPE" -d "$LOGIN_PAYLOAD")
echo "Response: $LOGIN_RESPONSE"

# Extract Token (if we needed it for authenticated requests)
TOKEN=$(echo $LOGIN_RESPONSE | grep -oP '"token":"\K[^"]+')
# echo "Token: $TOKEN"

# 3. Quiz Service: Create Quiz
echo -e "\n[3] Testing Create Quiz (Go Service)..."
QUIZ_PAYLOAD='{
  "title": "Integration Test Quiz",
  "description": "This is a test quiz created via integration script",
  "timeLimit": 30,
  "totalPoints": 100,
  "maxAttempts": 3,
  "isPublic": true,
  "topic": "Testing",
  "difficulty": "EASY",
  "creatorId": 1
}'
CREATE_QUIZ_RESPONSE=$(curl -s -X POST "$BASE_URL/quizzes" -H "$CONTENT_TYPE" -d "$QUIZ_PAYLOAD")
echo "Response: $CREATE_QUIZ_RESPONSE"

# Extract Quiz ID
QUIZ_ID=$(echo $CREATE_QUIZ_RESPONSE | grep -oP '"id":\K\d+')

if [ -z "$QUIZ_ID" ]; then
  echo "Error: Failed to create quiz. Skipping question creation."
else
  echo "Created Quiz ID: $QUIZ_ID"

  # 4. Quiz Service: Create Question
  echo -e "\n[4] Testing Create Question for Quiz ID $QUIZ_ID..."
  QUESTION_PAYLOAD='{
    "content": "Is this integration test working?",
    "type": "TRUE_FALSE",
    "difficulty": "EASY",
    "points": 10,
    "quizId": '$QUIZ_ID'
  }'
  CREATE_QUESTION_RESPONSE=$(curl -s -X POST "$BASE_URL/questions" -H "$CONTENT_TYPE" -d "$QUESTION_PAYLOAD")
  echo "Response: $CREATE_QUESTION_RESPONSE"
fi

# 5. Quiz Service: Get All Public Quizzes
echo -e "\n[5] Testing Get Public Quizzes..."
GET_QUIZZES_RESPONSE=$(curl -s -X GET "$BASE_URL/quizzes" -H "$CONTENT_TYPE")
# Limit output length
echo "Response (First 200 chars): ${GET_QUIZZES_RESPONSE:0:200}..."

# 6. Notification Service: Health Check (or similar)
# Assuming there is a health endpoint or we can try to get notifications for a user
echo -e "\n[6] Testing Notification Service (Get Notifications for user 1)..."
NOTIF_RESPONSE=$(curl -s -X GET "$BASE_URL/notifications/user/1" -H "$CONTENT_TYPE")
echo "Response: $NOTIF_RESPONSE"

echo -e "\n----------------------------------------------------------------"
echo "Integration Test Completed"
echo "----------------------------------------------------------------"
