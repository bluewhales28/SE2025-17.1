# PowerShell script to import merged database schema into quizz database

Write-Host "📦 Importing database schema into quizz database..." -ForegroundColor Cyan

# Copy SQL file to postgres container
docker cp database_merged.sql postgres:/tmp/database_merged.sql

# Import SQL file
docker exec -i postgres psql -U postgres -d quizz -f /tmp/database_merged.sql

# Clean up
docker exec postgres rm /tmp/database_merged.sql

Write-Host "✅ Database import completed!" -ForegroundColor Green
Write-Host ""
Write-Host "To verify, run:" -ForegroundColor Yellow
Write-Host "  docker exec -it postgres psql -U postgres -d quizz -c `"\dt`"" -ForegroundColor Yellow

