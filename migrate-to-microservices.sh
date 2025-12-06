#!/bin/bash

# ============================================================
# Database Per Service Migration Script
# ============================================================

set -e

echo "============================================================"
echo "Starting Database Per Service Migration"
echo "============================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Backup current database
echo -e "\n${YELLOW}Step 1: Backing up current database...${NC}"
if docker ps | grep -q postgres; then
    echo "Creating backup of current database..."
    docker exec postgres pg_dump -U postgres quizz > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql
    echo -e "${GREEN}✓ Backup completed${NC}"
else
    echo -e "${YELLOW}⚠ No existing postgres container found. Skipping backup.${NC}"
fi

# Step 2: Stop current services
echo -e "\n${YELLOW}Step 2: Stopping current services...${NC}"
docker-compose down
echo -e "${GREEN}✓ Services stopped${NC}"

# Step 3: Create .env file for microservices
echo -e "\n${YELLOW}Step 3: Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    echo "Creating .env file from example..."
    cp .env.microservices.example .env
    echo -e "${GREEN}✓ .env file created. Please update with your actual credentials.${NC}"
else
    echo -e "${YELLOW}⚠ .env file already exists. Please verify it has the new database credentials.${NC}"
fi

# Step 4: Start databases only
echo -e "\n${YELLOW}Step 4: Starting individual databases...${NC}"
docker-compose -f docker-compose.microservices.yml up -d \
    user-auth-db \
    quiz-db \
    class-db \
    notification-db \
    recommendation-db \
    analytics-db

echo "Waiting for databases to be ready..."
sleep 15

# Check database health
echo -e "\n${YELLOW}Checking database health...${NC}"
databases=("user-auth-db:user_auth_db:auth_user" "quiz-db:quiz_db:quiz_user" "class-db:class_db:class_user" "notification-db:notification_db:notif_user" "recommendation-db:recommendation_db:recommendation_user" "analytics-db:analytics_db:analytics_user")

for db_info in "${databases[@]}"; do
    IFS=':' read -r container dbname user <<< "$db_info"
    if docker exec $container pg_isready -U $user -d $dbname > /dev/null 2>&1; then
        echo -e "${GREEN}✓ $container is ready${NC}"
    else
        echo -e "${RED}✗ $container is not ready${NC}"
        exit 1
    fi
done

# Step 5: Verify schema initialization
echo -e "\n${YELLOW}Step 5: Verifying schema initialization...${NC}"

echo "Checking user-auth-db tables..."
user_tables=$(docker exec user-auth-db psql -U auth_user -d user_auth_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "  Tables in user_auth_db: $(echo $user_tables | xargs)"

echo "Checking quiz-db tables..."
quiz_tables=$(docker exec quiz-db psql -U quiz_user -d quiz_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "  Tables in quiz_db: $(echo $quiz_tables | xargs)"

echo "Checking class-db tables..."
class_tables=$(docker exec class-db psql -U class_user -d class_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "  Tables in class_db: $(echo $class_tables | xargs)"

echo "Checking notification-db tables..."
notif_tables=$(docker exec notification-db psql -U notif_user -d notification_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "  Tables in notification_db: $(echo $notif_tables | xargs)"

echo "Checking recommendation-db tables..."
rec_tables=$(docker exec recommendation-db psql -U recommendation_user -d recommendation_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "  Tables in recommendation_db: $(echo $rec_tables | xargs)"

echo "Checking analytics-db tables..."
analytics_tables=$(docker exec analytics-db psql -U analytics_user -d analytics_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "  Tables in analytics_db: $(echo $analytics_tables | xargs)"

if [ "$(echo $user_tables | xargs)" -gt 0 ] && [ "$(echo $quiz_tables | xargs)" -gt 0 ] && [ "$(echo $class_tables | xargs)" -gt 0 ]; then
    echo -e "${GREEN}✓ All databases initialized successfully${NC}"
else
    echo -e "${RED}✗ Some databases failed to initialize${NC}"
    exit 1
fi

# Step 6: Start infrastructure services
echo -e "\n${YELLOW}Step 6: Starting infrastructure services...${NC}"
docker-compose -f docker-compose.microservices.yml up -d redis rabbitmq

echo "Waiting for infrastructure services..."
sleep 10

# Step 7: Start all microservices
echo -e "\n${YELLOW}Step 7: Starting microservices...${NC}"
docker-compose -f docker-compose.microservices.yml up -d

echo "Waiting for services to start..."
sleep 20

# Step 8: Check service health
echo -e "\n${YELLOW}Step 8: Checking service health...${NC}"

services=("user-auth-service:8080" "notification-service:8082" "quiz-service:8083" "class-assignment-service:8081")

for service_info in "${services[@]}"; do
    IFS=':' read -r service port <<< "$service_info"
    if docker ps | grep -q $service; then
        echo -e "${GREEN}✓ $service is running${NC}"
    else
        echo -e "${RED}✗ $service is not running${NC}"
    fi
done

# Step 9: Display service URLs
echo -e "\n${GREEN}============================================================${NC}"
echo -e "${GREEN}Migration completed successfully!${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo "Database Ports:"
echo "  - User Auth DB:        localhost:5432"
echo "  - Quiz DB:             localhost:5433"
echo "  - Class DB:            localhost:5434"
echo "  - Notification DB:     localhost:5435"
echo "  - Recommendation DB:   localhost:5436"
echo "  - Analytics DB:        localhost:5437"
echo ""
echo "Service URLs:"
echo "  - User Auth Service:   http://localhost:8080"
echo "  - Class Service:       http://localhost:8081"
echo "  - Notification Service: http://localhost:8082"
echo "  - Quiz Service:        http://localhost:8083"
echo "  - Analytics Service:   http://localhost:8084"
echo "  - Recommendation Service: http://localhost:8085"
echo "  - Frontend:            http://localhost:3000"
echo "  - Nginx:               http://localhost:80"
echo ""
echo "Management UIs:"
echo "  - RabbitMQ:            http://localhost:15672"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Test each service individually"
echo "  2. Verify inter-service communication"
echo "  3. Check logs: docker-compose -f docker-compose.microservices.yml logs -f [service-name]"
echo "  4. Monitor RabbitMQ queue for events"
echo ""
echo "To rollback:"
echo "  ./rollback-migration.sh"
echo ""
