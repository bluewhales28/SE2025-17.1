#!/bin/bash

# Script để fix Docker Compose không load .env file

echo "=========================================="
echo "🔧 Fixing Docker Compose .env loading"
echo "=========================================="
echo ""

cd /srv/SE2025-17.1

# 1. Kiểm tra file .env
echo "1️⃣  Checking .env file..."
if [ ! -f .env ]; then
    echo "❌ File .env not found!"
    exit 1
fi

echo "✅ File .env exists"
echo ""

# 2. Kiểm tra format (loại bỏ comment và empty lines)
echo "2️⃣  Checking .env format..."
SMTP_USER=$(grep "^SMTP_USER=" .env | cut -d'=' -f2)
SMTP_PASSWORD=$(grep "^SMTP_PASSWORD=" .env | cut -d'=' -f2)

if [ -z "$SMTP_USER" ] || [ -z "$SMTP_PASSWORD" ]; then
    echo "❌ SMTP_USER or SMTP_PASSWORD is empty in .env"
    echo "Current values:"
    echo "  SMTP_USER=$SMTP_USER"
    echo "  SMTP_PASSWORD=$SMTP_PASSWORD"
    exit 1
fi

echo "✅ SMTP config found in .env"
echo "  SMTP_USER=$SMTP_USER"
echo "  SMTP_PASSWORD=${SMTP_PASSWORD:0:4}**** (hidden)"
echo ""

# 3. Export các biến môi trường
echo "3️⃣  Exporting environment variables..."
export $(grep -v '^#' .env | grep -v '^$' | xargs)
echo "✅ Environment variables exported"
echo ""

# 4. Kiểm tra các biến đã được export
echo "4️⃣  Verifying exported variables..."
if [ -z "$SMTP_USER" ] || [ -z "$SMTP_PASSWORD" ]; then
    echo "❌ Variables not exported correctly"
    exit 1
fi

echo "✅ Variables exported:"
echo "  SMTP_USER=$SMTP_USER"
echo "  SMTP_PASSWORD=${SMTP_PASSWORD:0:4}**** (hidden)"
echo ""

# 5. Down và up lại notification-service
echo "5️⃣  Restarting notification-service with new env..."
docker compose -f docker-compose.prod.yml stop notification-service
docker compose -f docker-compose.prod.yml rm -f notification-service
docker compose -f docker-compose.prod.yml up -d notification-service

echo ""
echo "⏳ Waiting for service to start..."
sleep 5

# 6. Kiểm tra lại
echo "6️⃣  Verifying SMTP config in container..."
CONTAINER_SMTP_USER=$(docker exec notification-service env 2>/dev/null | grep "^SMTP_USER=" | cut -d'=' -f2)
CONTAINER_SMTP_PASSWORD=$(docker exec notification-service env 2>/dev/null | grep "^SMTP_PASSWORD=" | cut -d'=' -f2)

if [ -z "$CONTAINER_SMTP_USER" ] || [ -z "$CONTAINER_SMTP_PASSWORD" ]; then
    echo "❌ SMTP config still empty in container!"
    echo "  SMTP_USER=$CONTAINER_SMTP_USER"
    echo "  SMTP_PASSWORD=$CONTAINER_SMTP_PASSWORD"
    echo ""
    echo "📝 Trying alternative method: Using --env-file flag..."
    docker compose -f docker-compose.prod.yml stop notification-service
    docker compose -f docker-compose.prod.yml rm -f notification-service
    docker compose -f docker-compose.prod.yml --env-file .env up -d notification-service
    sleep 5
    
    # Check again
    CONTAINER_SMTP_USER=$(docker exec notification-service env 2>/dev/null | grep "^SMTP_USER=" | cut -d'=' -f2)
    CONTAINER_SMTP_PASSWORD=$(docker exec notification-service env 2>/dev/null | grep "^SMTP_PASSWORD=" | cut -d'=' -f2)
    
    if [ -z "$CONTAINER_SMTP_USER" ] || [ -z "$CONTAINER_SMTP_PASSWORD" ]; then
        echo "❌ Still not working. Please check docker-compose.prod.yml configuration."
        exit 1
    fi
fi

echo "✅ SMTP config loaded in container:"
echo "  SMTP_USER=$CONTAINER_SMTP_USER"
echo "  SMTP_PASSWORD=${CONTAINER_SMTP_PASSWORD:0:4}**** (hidden)"
echo ""

echo "=========================================="
echo "✅ Fix completed!"
echo "=========================================="
echo ""
echo "📝 Next steps:"
echo "1. Test email sending by registering a new user"
echo "2. Check logs: docker logs notification-service --tail 20"
echo "3. Check notifications: docker exec -it postgres psql -U postgres -d quizz -c \"SELECT id, type, status FROM notifications ORDER BY created_at DESC LIMIT 5;\""

