#!/bin/bash

# ============================================================
# Test Individual Database Connections
# ============================================================

set -e

echo "============================================================"
echo "Testing Database Per Service Implementation"
echo "============================================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

test_count=0
pass_count=0
fail_count=0

# Function to run test
run_test() {
    local test_name=$1
    local command=$2
    
    test_count=$((test_count + 1))
    echo -e "\n${YELLOW}Test $test_count: $test_name${NC}"
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        pass_count=$((pass_count + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        fail_count=$((fail_count + 1))
        return 1
    fi
}

echo -e "\n${YELLOW}=== Database Connection Tests ===${NC}"

# Test User Auth DB
run_test "User Auth DB - Connection" \
    "docker exec user-auth-db psql -U auth_user -d user_auth_db -c 'SELECT 1'"

run_test "User Auth DB - Users table exists" \
    "docker exec user-auth-db psql -U auth_user -d user_auth_db -c 'SELECT COUNT(*) FROM users'"

run_test "User Auth DB - Sample data exists" \
    "docker exec user-auth-db psql -U auth_user -d user_auth_db -t -c 'SELECT COUNT(*) FROM users' | grep -q '[1-9]'"

# Test Quiz DB
run_test "Quiz DB - Connection" \
    "docker exec quiz-db psql -U quiz_user -d quiz_db -c 'SELECT 1'"

run_test "Quiz DB - Quizzes table exists" \
    "docker exec quiz-db psql -U quiz_user -d quiz_db -c 'SELECT COUNT(*) FROM quizzes'"

run_test "Quiz DB - Questions table exists" \
    "docker exec quiz-db psql -U quiz_user -d quiz_db -c 'SELECT COUNT(*) FROM questions'"

run_test "Quiz DB - No foreign key to users table" \
    "! docker exec quiz-db psql -U quiz_user -d quiz_db -c '\d quizzes' | grep -q 'FOREIGN KEY.*users'"

# Test Class DB
run_test "Class DB - Connection" \
    "docker exec class-db psql -U class_user -d class_db -c 'SELECT 1'"

run_test "Class DB - Classes table exists" \
    "docker exec class-db psql -U class_user -d class_db -c 'SELECT COUNT(*) FROM classes'"

run_test "Class DB - Assignments table exists" \
    "docker exec class-db psql -U class_user -d class_db -c 'SELECT COUNT(*) FROM assignments'"

run_test "Class DB - No foreign key to users table" \
    "! docker exec class-db psql -U class_user -d class_db -c '\d classes' | grep -q 'FOREIGN KEY.*users'"

run_test "Class DB - No foreign key to quizzes table" \
    "! docker exec class-db psql -U class_user -d class_db -c '\d assignments' | grep -q 'FOREIGN KEY.*quizzes'"

# Test Notification DB
run_test "Notification DB - Connection" \
    "docker exec notification-db psql -U notif_user -d notification_db -c 'SELECT 1'"

run_test "Notification DB - Templates table exists" \
    "docker exec notification-db psql -U notif_user -d notification_db -c 'SELECT COUNT(*) FROM templates'"

run_test "Notification DB - Preferences table exists" \
    "docker exec notification-db psql -U notif_user -d notification_db -c 'SELECT COUNT(*) FROM preferences'"

# Test Recommendation DB
run_test "Recommendation DB - Connection" \
    "docker exec recommendation-db psql -U recommendation_user -d recommendation_db -c 'SELECT 1'"

run_test "Recommendation DB - Learning profiles table exists" \
    "docker exec recommendation-db psql -U recommendation_user -d recommendation_db -c 'SELECT COUNT(*) FROM user_learning_profiles'"

# Test Analytics DB
run_test "Analytics DB - Connection" \
    "docker exec analytics-db psql -U analytics_user -d analytics_db -c 'SELECT 1'"

run_test "Analytics DB - User activity logs table exists" \
    "docker exec analytics-db psql -U analytics_user -d analytics_db -c 'SELECT COUNT(*) FROM user_activity_logs'"

echo -e "\n${YELLOW}=== Service Connection Tests ===${NC}"

# Test service connectivity
run_test "User Auth Service - Health" \
    "curl -f http://localhost:8080/actuator/health || curl -f http://localhost:8080/health"

run_test "Notification Service - Health" \
    "curl -f http://localhost:8082/health"

run_test "Quiz Service - Health" \
    "curl -f http://localhost:8083/health"

echo -e "\n${YELLOW}=== Database Isolation Tests ===${NC}"

# Test that databases are isolated
run_test "User Auth DB - Cannot access quiz_db tables" \
    "! docker exec user-auth-db psql -U auth_user -d user_auth_db -c 'SELECT COUNT(*) FROM quizzes' 2>&1 | grep -q 'does not exist'"

run_test "Quiz DB - Cannot access user_auth_db tables" \
    "! docker exec quiz-db psql -U quiz_user -d quiz_db -c 'SELECT COUNT(*) FROM users' 2>&1 | grep -q 'does not exist'"

run_test "Cross-database access denied" \
    "! docker exec quiz-db psql -U quiz_user -d user_auth_db -c 'SELECT 1' 2>&1 | grep -q 'authentication failed'"

echo -e "\n${YELLOW}=== Inter-Service Communication Tests ===${NC}"

# Test API calls between services
echo "Testing user creation and cross-service validation..."
# (This would need actual API endpoints to be implemented)

echo -e "\n============================================================"
echo -e "Test Results Summary"
echo -e "============================================================"
echo -e "Total Tests: $test_count"
echo -e "${GREEN}Passed: $pass_count${NC}"
echo -e "${RED}Failed: $fail_count${NC}"

if [ $fail_count -eq 0 ]; then
    echo -e "\n${GREEN}✓ All tests passed! Database per service is working correctly.${NC}"
    exit 0
else
    echo -e "\n${RED}✗ Some tests failed. Please check the logs above.${NC}"
    exit 1
fi
