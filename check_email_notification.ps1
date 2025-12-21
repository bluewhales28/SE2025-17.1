# PowerShell script để kiểm tra email notification system

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🔍 Checking Email Notification System" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check RabbitMQ
Write-Host "1️⃣  Checking RabbitMQ..." -ForegroundColor Yellow
$rabbitmq = docker ps | Select-String "rabbitmq"
if ($rabbitmq) {
    Write-Host "✅ RabbitMQ is running" -ForegroundColor Green
} else {
    Write-Host "❌ RabbitMQ is NOT running" -ForegroundColor Red
}
Write-Host ""

# 2. Check user-auth-service logs
Write-Host "2️⃣  Checking user-auth-service logs (last 20 lines)..." -ForegroundColor Yellow
Write-Host "--- Looking for email/rabbitmq related logs ---" -ForegroundColor Gray
docker logs user-auth-service --tail 20 2>&1 | Select-String -Pattern "email|rabbit|welcome" -CaseSensitive:$false
Write-Host ""

# 3. Check notification-service logs
Write-Host "3️⃣  Checking notification-service logs (last 20 lines)..." -ForegroundColor Yellow
Write-Host "--- Looking for RabbitMQ connection and events ---" -ForegroundColor Gray
docker logs notification-service --tail 20 2>&1 | Select-String -Pattern "rabbit|event|notification|email" -CaseSensitive:$false
Write-Host ""

# 4. Check notifications in database
Write-Host "4️⃣  Checking notifications in database..." -ForegroundColor Yellow
$notifications = docker exec postgres psql -U postgres -d quizz -t -c "SELECT COUNT(*) FROM notifications;" 2>$null
if ($notifications -and $notifications.Trim() -ne "0") {
    Write-Host "✅ Found notifications" -ForegroundColor Green
    Write-Host "Recent notifications:"
    docker exec postgres psql -U postgres -d quizz -c "SELECT id, type, status, channel, created_at FROM notifications ORDER BY created_at DESC LIMIT 5;" 2>$null
} else {
    Write-Host "⚠️  No notifications found in database" -ForegroundColor Yellow
}
Write-Host ""

# 5. Check recent users
Write-Host "5️⃣  Checking recent users..." -ForegroundColor Yellow
Write-Host "Recent users (last 5):"
docker exec postgres psql -U postgres -d quizz -c "SELECT id, email, full_name, created_at FROM users ORDER BY created_at DESC LIMIT 5;" 2>$null
Write-Host ""

# 6. Check email templates
Write-Host "6️⃣  Checking email templates..." -ForegroundColor Yellow
$template = docker exec postgres psql -U postgres -d quizz -t -c "SELECT COUNT(*) FROM email_templates WHERE name = 'user_registered';" 2>$null
if ($template.Trim() -eq "1") {
    Write-Host "✅ Template 'user_registered' exists" -ForegroundColor Green
} else {
    Write-Host "❌ Template 'user_registered' NOT found" -ForegroundColor Red
}
Write-Host ""

# 7. Check SMTP config
Write-Host "7️⃣  Checking SMTP configuration..." -ForegroundColor Yellow
$smtpUser = docker exec notification-service env 2>$null | Select-String "SMTP_USER"
$smtpPass = docker exec notification-service env 2>$null | Select-String "SMTP_PASSWORD"
if ($smtpUser -and $smtpPass) {
    Write-Host "✅ SMTP configuration is set" -ForegroundColor Green
} else {
    Write-Host "❌ SMTP configuration is missing" -ForegroundColor Red
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Check completed!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

