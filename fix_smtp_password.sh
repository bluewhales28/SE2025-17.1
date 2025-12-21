#!/bin/bash

# Script để fix SMTP_PASSWORD trong .env.production (bỏ khoảng trắng)

echo "=========================================="
echo "🔧 Fixing SMTP_PASSWORD in .env.production"
echo "=========================================="
echo ""

if [ ! -f ".env.production" ]; then
    echo "❌ File .env.production not found!"
    exit 1
fi

# Backup file
cp .env.production .env.production.backup
echo "✅ Created backup: .env.production.backup"
echo ""

# Check current SMTP_PASSWORD
CURRENT_PASSWORD=$(grep "^SMTP_PASSWORD=" .env.production | cut -d'=' -f2-)
echo "Current SMTP_PASSWORD: $CURRENT_PASSWORD"
echo ""

# Remove spaces from password
if [[ "$CURRENT_PASSWORD" =~ [[:space:]] ]]; then
    NEW_PASSWORD=$(echo "$CURRENT_PASSWORD" | tr -d ' ')
    echo "⚠️  Password contains spaces, removing them..."
    echo "New SMTP_PASSWORD: $NEW_PASSWORD"
    echo ""
    
    # Update .env.production
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/^SMTP_PASSWORD=.*/SMTP_PASSWORD=$NEW_PASSWORD/" .env.production
    else
        # Linux
        sed -i "s/^SMTP_PASSWORD=.*/SMTP_PASSWORD=$NEW_PASSWORD/" .env.production
    fi
    
    echo "✅ Updated .env.production"
    echo ""
    echo "📝 Next steps:"
    echo "1. Restart notification-service:"
    echo "   docker compose -f docker-compose.prod.yml restart notification-service"
    echo ""
    echo "2. Or rebuild:"
    echo "   docker compose -f docker-compose.prod.yml up -d --build notification-service"
    echo ""
    echo "3. Check logs:"
    echo "   docker logs notification-service --tail 20 | grep SMTP"
else
    echo "✅ Password already has no spaces, no changes needed"
fi

echo ""
echo "=========================================="

