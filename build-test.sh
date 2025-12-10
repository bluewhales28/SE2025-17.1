#!/bin/bash

# Build Optimization Script
# This script builds all services in parallel for faster build times

set -e

echo "🚀 Starting optimized parallel build..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Enable BuildKit for better caching
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Clean old images (optional)
read -p "Do you want to clean old images first? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🧹 Cleaning old images...${NC}"
    docker system prune -f
fi

# Build all services in parallel
echo -e "${YELLOW}📦 Building all services in parallel...${NC}"

# Start time
START_TIME=$(date +%s)

# Build in parallel using docker compose
docker compose -f docker-compose.yml build \
    --parallel \
    --progress=plain 2>&1 | tee build.log

# End time
END_TIME=$(date +%s)
BUILD_TIME=$((END_TIME - START_TIME))

echo -e "${GREEN}✅ Build completed in ${BUILD_TIME} seconds${NC}"

# Show image sizes
echo -e "\n${YELLOW}📊 Image sizes:${NC}"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep "se2025-171"

# Test services
echo -e "\n${YELLOW}🧪 Starting services for testing...${NC}"
docker compose -f docker-compose.yml up -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 10

# Check service health
echo -e "\n${YELLOW}🔍 Service status:${NC}"
docker compose -f docker-compose.yml ps

# Basic health checks
echo -e "\n${YELLOW}🏥 Running health checks...${NC}"

echo "Frontend..."
curl -f http://localhost:3000 > /dev/null 2>&1 && echo -e "${GREEN}✅ Frontend OK${NC}" || echo -e "${RED}❌ Frontend FAIL${NC}"

echo "User Auth Service..."
curl -f http://localhost:8082/actuator/health > /dev/null 2>&1 && echo -e "${GREEN}✅ User Auth OK${NC}" || echo -e "${RED}❌ User Auth FAIL${NC}"

echo "Quiz Service..."
curl -f http://localhost:8083/health > /dev/null 2>&1 && echo -e "${GREEN}✅ Quiz Service OK${NC}" || echo -e "${RED}❌ Quiz Service FAIL${NC}"

echo "Notification Service..."
curl -f http://localhost:8080/health > /dev/null 2>&1 && echo -e "${GREEN}✅ Notification Service OK${NC}" || echo -e "${RED}❌ Notification Service FAIL${NC}"

echo -e "\n${GREEN}🎉 Build and test completed!${NC}"
echo -e "${YELLOW}View logs: docker compose -f docker-compose.yml logs -f${NC}"
echo -e "${YELLOW}Stop services: docker compose -f docker-compose.yml down${NC}"
