#!/bin/bash

# Deploy Script for Server 20.6.128.179
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment to production server..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Server info
SERVER_USER="longvq"
SERVER_IP="20.6.128.179"
PROJECT_DIR="SE2025-17.1"

echo -e "${YELLOW}📦 Step 1: Pulling latest code from Git...${NC}"
git pull origin main

echo -e "${YELLOW}📋 Step 2: Checking .env file...${NC}"
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Error: .env.production not found!${NC}"
    exit 1
fi

echo -e "${YELLOW}🔐 Step 3: Copying files to server...${NC}"
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.next' --exclude 'target' \
    ./ ${SERVER_USER}@${SERVER_IP}:~/${PROJECT_DIR}/

echo -e "${YELLOW}⚙️  Step 4: Setting up environment on server...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd SE2025-17.1

# Copy production env
cp .env.production .env

# Stop old containers
docker-compose -f docker-compose.prod.yml down

# Remove old images (optional - uncomment if needed)
# docker-compose -f docker-compose.prod.yml down --rmi all

# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check status
docker-compose -f docker-compose.prod.yml ps

echo "✅ Deployment completed!"
echo "🌐 Frontend: http://20.6.128.179"
echo "📊 RabbitMQ Management: http://20.6.128.179:15672"
EOF

echo -e "${GREEN}✅ Deployment to server completed successfully!${NC}"
echo -e "${GREEN}🌐 Access your app at: http://20.6.128.179${NC}"
