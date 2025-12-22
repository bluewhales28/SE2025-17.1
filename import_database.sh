#!/bin/bash

# Script to import merged database schema into quizz database

echo "📦 Importing database schema into quizz database..."

# Copy SQL file to postgres container
docker cp database_merged.sql postgres:/tmp/database_merged.sql

# Import SQL file
docker exec -i postgres psql -U postgres -d quizz -f /tmp/database_merged.sql

# Clean up
docker exec postgres rm /tmp/database_merged.sql

echo "✅ Database import completed!"
echo ""
echo "To verify, run:"
echo "  docker exec -it postgres psql -U postgres -d quizz -c \"\\dt\""

