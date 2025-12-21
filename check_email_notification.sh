#!/bin/bash

# Script để kiểm tra email notification system

echo "=========================================="
echo "🔍 Checking Email Notification System"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check RabbitMQ
echo "1️⃣  Checking RabbitMQ..."
if docker ps | grep -q rabbitmq; then
    echo -e "${GREEN}✅ RabbitMQ is running${NC}"
else
    echo -e "${RED}❌ RabbitMQ is NOT running${NC}"
fi
echo ""

# 2. Check user-auth-service logs
echo "2️⃣  Checking user-auth-service logs (last 20 lines)..."
echo "--- Looking for email/rabbitmq related logs ---"
docker logs user-auth-service --tail 20 2>&1 | grep -i "email\|rabbit\|welcome" || echo "No email/rabbitmq logs found"
echo ""

# 3. Check notification-service logs
echo "3️⃣  Checking notification-service logs (last 20 lines)..."
echo "--- Looking for RabbitMQ connection and events ---"
docker logs notification-service --tail 20 2>&1 | grep -i "rabbit\|event\|notification\|email" || echo "No relevant logs found"
echo ""

# 4. Check notifications in database
echo "4️⃣  Checking notifications in database..."
NOTIFICATIONS=$(docker exec postgres psql -U postgres -d quizz -t -c "SELECT COUNT(*) FROM notifications;" 2>/dev/null | tr -d ' ')
if [ -n "$NOTIFICATIONS" ] && [ "$NOTIFICATIONS" != "0" ]; then
    echo -e "${GREEN}✅ Found $NOTIFICATIONS notification(s)${NC}"
    echo "Recent notifications:"
    docker exec postgres psql -U postgres -d quizz -c "SELECT id, type, status, channel, created_at FROM notifications ORDER BY created_at DESC LIMIT 5;" 2>/dev/null
else
    echo -e "${YELLOW}⚠️  No notifications found in database${NC}"
fi
echo ""

# 5. Check recent users
echo "5️⃣  Checking recent users..."
echo "Recent users (last 5):"
docker exec postgres psql -U postgres -d quizz -c "SELECT id, email, full_name, created_at FROM users ORDER BY created_at DESC LIMIT 5;" 2>/dev/null
echo ""

# 6. Check email templates
echo "6️⃣  Checking email templates..."
TEMPLATE_COUNT=$(docker exec postgres psql -U postgres -d quizz -t -c "SELECT COUNT(*) FROM email_templates WHERE name = 'user_registered';" 2>/dev/null | tr -d ' ')
if [ "$TEMPLATE_COUNT" = "1" ]; then
    echo -e "${GREEN}✅ Template 'user_registered' exists${NC}"
else
    echo -e "${RED}❌ Template 'user_registered' NOT found${NC}"
fi
echo ""

# 7. Check SMTP config
echo "7️⃣  Checking SMTP configuration..."
SMTP_USER=$(docker exec notification-service env 2>/dev/null | grep SMTP_USER | cut -d'=' -f2)
SMTP_PASSWORD=$(docker exec notification-service env 2>/dev/null | grep SMTP_PASSWORD | cut -d'=' -f2)
if [ -n "$SMTP_USER" ] && [ -n "$SMTP_PASSWORD" ]; then
    echo -e "${GREEN}✅ SMTP_USER is set: ${SMTP_USER}${NC}"
    echo -e "${GREEN}✅ SMTP_PASSWORD is set (hidden)${NC}"
else
    echo -e "${RED}❌ SMTP configuration is missing${NC}"
fi
echo ""

# 8. Check RabbitMQ queues
echo "8️⃣  Checking RabbitMQ queues..."
if docker ps | grep -q rabbitmq; then
    echo "Queues:"
    docker exec rabbitmq rabbitmqctl list_queues 2>/dev/null || echo "Cannot list queues"
    echo ""
    echo "Exchanges:"
    docker exec rabbitmq rabbitmqctl list_exchanges 2>/dev/null || echo "Cannot list exchanges"
else
    echo -e "${RED}❌ RabbitMQ is not running, cannot check queues${NC}"
fi
echo ""

echo "=========================================="
echo "✅ Check completed!"
echo "=========================================="
echo ""
echo "📝 Next steps:"
echo "1. If RabbitMQ is not running: docker compose -f docker-compose.prod.yml up -d rabbitmq"
echo "2. If notification-service failed to connect: Check logs and restart"
echo "3. If no notifications: Check user-auth-service logs for 'Welcome email event published'"
echo "4. If notifications exist but status='failed': Check SMTP config and email templates"

