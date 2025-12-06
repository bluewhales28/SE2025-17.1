#!/bin/bash

# ============================================================
# Rollback to Shared Database Script
# ============================================================

set -e

echo "============================================================"
echo "Rolling back to shared database architecture"
echo "============================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "\n${YELLOW}Step 1: Stopping microservices...${NC}"
docker-compose -f docker-compose.microservices.yml down

echo -e "\n${YELLOW}Step 2: Starting original docker-compose...${NC}"
docker-compose up -d

echo "Waiting for services to start..."
sleep 15

echo -e "\n${YELLOW}Step 3: Finding latest backup...${NC}"
latest_backup=$(ls -t backup_before_migration_*.sql 2>/dev/null | head -1)

if [ -z "$latest_backup" ]; then
    echo -e "${YELLOW}⚠ No backup file found. Starting with fresh database.${NC}"
else
    echo "Found backup: $latest_backup"
    read -p "Do you want to restore this backup? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Restoring database..."
        docker exec -i postgres psql -U postgres -d quizz < $latest_backup
        echo -e "${GREEN}✓ Database restored${NC}"
    fi
fi

echo -e "\n${GREEN}============================================================${NC}"
echo -e "${GREEN}Rollback completed!${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo "Services are now running with shared database."
echo "Check status: docker-compose ps"
echo ""
