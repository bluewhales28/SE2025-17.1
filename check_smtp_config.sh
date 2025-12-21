#!/bin/bash

# Script để kiểm tra SMTP configuration

echo "=========================================="
echo "🔍 Checking SMTP Configuration"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check .env.production file
echo "1️⃣  Checking .env.production file..."
if [ -f ".env.production" ]; then
    echo -e "${GREEN}✅ .env.production exists${NC}"
    
    SMTP_USER_ENV=$(grep "^SMTP_USER=" .env.production | cut -d'=' -f2)
    SMTP_PASS_ENV=$(grep "^SMTP_PASSWORD=" .env.production | cut -d'=' -f2)
    
    if [ -n "$SMTP_USER_ENV" ] && [ "$SMTP_USER_ENV" != "" ]; then
        echo -e "${GREEN}✅ SMTP_USER is set in .env.production: ${SMTP_USER_ENV}${NC}"
    else
        echo -e "${RED}❌ SMTP_USER is NOT set in .env.production${NC}"
    fi
    
    if [ -n "$SMTP_PASS_ENV" ] && [ "$SMTP_PASS_ENV" != "" ]; then
        echo -e "${GREEN}✅ SMTP_PASSWORD is set in .env.production (hidden)${NC}"
    else
        echo -e "${RED}❌ SMTP_PASSWORD is NOT set in .env.production${NC}"
    fi
else
    echo -e "${RED}❌ .env.production file NOT found${NC}"
fi
echo ""

# 2. Check notification-service container environment
echo "2️⃣  Checking notification-service container environment..."
if docker ps | grep -q notification-service; then
    SMTP_USER_CONTAINER=$(docker exec notification-service env 2>/dev/null | grep "^SMTP_USER=" | cut -d'=' -f2)
    SMTP_PASS_CONTAINER=$(docker exec notification-service env 2>/dev/null | grep "^SMTP_PASSWORD=" | cut -d'=' -f2)
    SMTP_HOST_CONTAINER=$(docker exec notification-service env 2>/dev/null | grep "^SMTP_HOST=" | cut -d'=' -f2)
    SMTP_PORT_CONTAINER=$(docker exec notification-service env 2>/dev/null | grep "^SMTP_PORT=" | cut -d'=' -f2)
    
    if [ -n "$SMTP_USER_CONTAINER" ] && [ "$SMTP_USER_CONTAINER" != "" ]; then
        echo -e "${GREEN}✅ SMTP_USER in container: ${SMTP_USER_CONTAINER}${NC}"
    else
        echo -e "${RED}❌ SMTP_USER is EMPTY in container${NC}"
    fi
    
    if [ -n "$SMTP_PASS_CONTAINER" ] && [ "$SMTP_PASS_CONTAINER" != "" ]; then
        echo -e "${GREEN}✅ SMTP_PASSWORD is set in container (hidden)${NC}"
    else
        echo -e "${RED}❌ SMTP_PASSWORD is EMPTY in container${NC}"
    fi
    
    if [ -n "$SMTP_HOST_CONTAINER" ]; then
        echo -e "${GREEN}✅ SMTP_HOST: ${SMTP_HOST_CONTAINER}${NC}"
    else
        echo -e "${YELLOW}⚠️  SMTP_HOST not set (will use default: smtp.gmail.com)${NC}"
    fi
    
    if [ -n "$SMTP_PORT_CONTAINER" ]; then
        echo -e "${GREEN}✅ SMTP_PORT: ${SMTP_PORT_CONTAINER}${NC}"
    else
        echo -e "${YELLOW}⚠️  SMTP_PORT not set (will use default: 587)${NC}"
    fi
else
    echo -e "${RED}❌ notification-service container is NOT running${NC}"
fi
echo ""

# 3. Check recent SMTP errors in logs
echo "3️⃣  Checking recent SMTP errors in logs..."
SMTP_ERRORS=$(docker logs notification-service --tail 50 2>&1 | grep -i "username and password not accepted" | wc -l)
if [ "$SMTP_ERRORS" -gt 0 ]; then
    echo -e "${RED}❌ Found $SMTP_ERRORS SMTP authentication errors in recent logs${NC}"
    echo "Recent errors:"
    docker logs notification-service --tail 50 2>&1 | grep -i "username and password not accepted" | tail -3
else
    echo -e "${GREEN}✅ No recent SMTP authentication errors${NC}"
fi
echo ""

# 4. Check notification status
echo "4️⃣  Checking notification status in database..."
FAILED_NOTIFICATIONS=$(docker exec postgres psql -U postgres -d quizz -t -c "SELECT COUNT(*) FROM notifications WHERE status = 'failed';" 2>/dev/null | tr -d ' ')
if [ -n "$FAILED_NOTIFICATIONS" ] && [ "$FAILED_NOTIFICATIONS" != "0" ]; then
    echo -e "${YELLOW}⚠️  Found $FAILED_NOTIFICATIONS failed notifications${NC}"
    echo "Recent failed notifications:"
    docker exec postgres psql -U postgres -d quizz -c "SELECT id, type, status, created_at FROM notifications WHERE status = 'failed' ORDER BY created_at DESC LIMIT 5;" 2>/dev/null
else
    echo -e "${GREEN}✅ No failed notifications${NC}"
fi
echo ""

echo "=========================================="
echo "✅ Check completed!"
echo "=========================================="
echo ""
echo "📝 Next steps if SMTP_USER or SMTP_PASSWORD is empty:"
echo "1. Edit .env.production and add:"
echo "   SMTP_USER=your-email@gmail.com"
echo "   SMTP_PASSWORD=your-gmail-app-password"
echo ""
echo "2. Restart notification-service:"
echo "   docker compose -f docker-compose.prod.yml restart notification-service"
echo ""
echo "3. For Gmail, you MUST use App Password (not regular password)"
echo "   See: https://myaccount.google.com/apppasswords"

