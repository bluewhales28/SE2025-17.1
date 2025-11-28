#!/bin/bash

# User Auth Service - Manual API Testing Script
# This script tests all API endpoints with curl

BASE_URL="http://localhost:8080"

echo "=========================================="
echo "User Auth Service - API Test Suite"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper function to test endpoint
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  local headers=$5
  
  ((TOTAL_TESTS++))
  
  echo -e "${YELLOW}Test $TOTAL_TESTS: $name${NC}"
  echo "Request: $method $endpoint"
  
  if [ -z "$data" ]; then
    response=$(curl -s -X $method "$BASE_URL$endpoint" $headers)
  else
    response=$(curl -s -X $method "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      $headers \
      -d "$data")
  fi
  
  # Check if response contains "status" field
  if echo "$response" | grep -q "status"; then
    status=$(echo "$response" | grep -o '"status":[0-9]*' | head -1 | cut -d':' -f2)
    if [ "$status" = "200" ] || [ "$status" = "201" ]; then
      echo -e "${GREEN}✓ PASSED (Status: $status)${NC}"
      ((PASSED_TESTS++))
    else
      echo -e "${RED}✗ FAILED (Status: $status)${NC}"
      ((FAILED_TESTS++))
    fi
  else
    echo -e "${RED}✗ FAILED (Invalid response)${NC}"
    ((FAILED_TESTS++))
  fi
  
  echo "Response: $response"
  echo ""
  
  # Save response for later use
  echo "$response" > /tmp/response_$TOTAL_TESTS.json
}

# ==================== TEST SEQUENCE ====================

echo "Step 1: Register User 1"
USER1_DATA='{"email":"user1@test.com","passwordHash":"password123","fullName":"User One","phoneNumber":"0912345678","dateOfBirth":"1990-01-15","gender":"MALE","role":"USER"}'
test_endpoint "Register User 1" "POST" "/users" "$USER1_DATA"

echo "Step 2: Register User 2"
USER2_DATA='{"email":"user2@test.com","passwordHash":"password456","fullName":"User Two","phoneNumber":"0987654321","dateOfBirth":"1995-05-20","gender":"FEMALE","role":"USER"}'
test_endpoint "Register User 2" "POST" "/users" "$USER2_DATA"

echo "Step 3: Register Admin User"
ADMIN_DATA='{"email":"admin@test.com","passwordHash":"admin123","fullName":"Admin User","phoneNumber":"0909090909","dateOfBirth":"1985-03-10","gender":"MALE","role":"ADMIN"}'
test_endpoint "Register Admin" "POST" "/users" "$ADMIN_DATA"

echo "Step 4: Login User 1"
LOGIN_DATA='{"email":"user1@test.com","passwordHash":"password123"}'
test_endpoint "Login User 1" "POST" "/auth/login" "$LOGIN_DATA"

# Extract token from response
USER1_TOKEN=$(cat /tmp/response_4.json | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "User 1 Token: $USER1_TOKEN"
echo ""

echo "Step 5: Login User 2"
LOGIN2_DATA='{"email":"user2@test.com","passwordHash":"password456"}'
test_endpoint "Login User 2" "POST" "/auth/login" "$LOGIN2_DATA"

USER2_TOKEN=$(cat /tmp/response_5.json | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "User 2 Token: $USER2_TOKEN"
echo ""

echo "Step 6: Login Admin"
LOGIN_ADMIN_DATA='{"email":"admin@test.com","passwordHash":"admin123"}'
test_endpoint "Login Admin" "POST" "/auth/login" "$LOGIN_ADMIN_DATA"

ADMIN_TOKEN=$(cat /tmp/response_6.json | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Admin Token: $ADMIN_TOKEN"
echo ""

echo "Step 7: Get User 1 Profile (Authenticated)"
HEADERS="-H 'Authorization: Bearer $USER1_TOKEN'"
test_endpoint "Get Profile User 1" "GET" "/users/profile" "" "$HEADERS"

echo "Step 8: Update User 1 Profile"
UPDATE_DATA='{"fullName":"User One Updated","phoneNumber":"0911111111","dateOfBirth":"1990-01-15","gender":"MALE"}'
test_endpoint "Update User 1 Profile" "PUT" "/users/profile" "$UPDATE_DATA" "-H 'Authorization: Bearer $USER1_TOKEN'"

echo "Step 9: Search Users by Name"
test_endpoint "Search Users" "GET" "/users?fullName=User&page=1&size=10" "" "-H 'Authorization: Bearer $USER1_TOKEN'"

echo "Step 10: Get All Users (Admin Only)"
test_endpoint "Get All Users (Admin)" "GET" "/users/all?page=1&size=10&sortBy=createdAt" "" "-H 'Authorization: Bearer $ADMIN_TOKEN'"

echo "Step 11: Introspect User 1 Token"
INTROSPECT_DATA="{\"token\":\"$USER1_TOKEN\"}"
test_endpoint "Introspect Token" "POST" "/auth/introspect" "$INTROSPECT_DATA"

echo "Step 12: Refresh User 1 Token"
REFRESH_DATA="{\"token\":\"$USER1_TOKEN\"}"
test_endpoint "Refresh Token" "POST" "/auth/refresh" "$REFRESH_DATA"

echo "Step 13: Logout User 1"
LOGOUT_DATA="{\"token\":\"$USER1_TOKEN\"}"
test_endpoint "Logout User 1" "POST" "/auth/logout" "$LOGOUT_DATA"

echo "Step 14: Try Using Logged Out Token (Should Fail)"
test_endpoint "Verify Token Invalidated" "GET" "/users/profile" "" "-H 'Authorization: Bearer $USER1_TOKEN'"

echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed!${NC}"
  exit 1
fi
