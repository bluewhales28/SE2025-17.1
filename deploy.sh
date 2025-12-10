#!/bin/bash

# Deploy Script for Server 136.110.11.83
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment to production server..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Server info
SERVER_USER="lequangtin_t67"
SERVER_IP="136.110.11.83"
PROJECT_DIR="/srv"

echo -e "${YELLOW}📦 Step 1: Pulling latest code from Git...${NC}"
git pull origin main

echo -e "${YELLOW}📋 Step 2: Checking .env file...${NC}"
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Error: .env.production not found!${NC}"
    exit 1
fi

echo -e "${YELLOW}🔐 Step 3: Deploying to server...${NC}"

echo -e "${YELLOW}⚙️  Step 4: Setting up environment on server...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /srv/SE2025-17.1

# Pull latest code
git config --global --add safe.directory /srv/SE2025-17.1
git pull origin main

# Create .env file with full configuration
sudo tee .env > /dev/null << 'ENVEOF'
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
DB_NAME=quizz
JWT_SECRET=5020f057d0d31c44d2397a3265c89b86b95a1903160610e290786cfe36e43e7b
FRONTEND_URL=http://136.110.11.83
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=luntanson@gmail.com
SMTP_PASSWORD=rfca yvny tdab drdv
SMTP_FROM_EMAIL=luntanson@gmail.com
SMTP_FROM_NAME=Quiz App
ENVEOF

# Create frontend environment
echo 'NEXT_PUBLIC_API_URL=http://136.110.11.83/api/v1' > frontend/.env.production

# Stop old containers
sudo docker compose -f docker-compose.prod.yml down

# Build and start services
sudo docker compose -f docker-compose.prod.yml up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Insert email templates
echo "📧 Adding email templates..."
sudo docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d quizz << 'SQLEOF'
INSERT INTO email_templates (name, subject, body_html, body_text, channel) VALUES
('password_reset', 'Password Reset Request - Quiz App', '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1>Password Reset Request</h1><p>Hello {{.user_name}},</p><p>Click the link below to reset your password:</p><p><a href="{{.reset_url}}">Reset Password</a></p><p>This link will expire in 1 hour.</p></div>', 'Password reset request. Click link to reset: {{.reset_url}}', 'email'),
('user_registered', 'Welcome to Quiz App', '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1>Welcome to Quiz App</h1><p>Hello {{.user_name}},</p><p>Thank you for joining our community.</p></div>', 'Welcome to Quiz App. Thank you for joining our community.', 'email'),
('quiz_assigned', 'New Quiz Assignment - Quiz App', '<div><h1>New Quiz Assignment</h1><p>Hello {{.student_name}},</p><p>You have been assigned a new quiz: <strong>{{.quiz_title}}</strong></p></div>', 'New quiz assigned: {{.quiz_title}}. Due: {{.due_date}}', 'email'),
('quiz_result', 'Quiz Result - Quiz App', '<div><h1>Quiz Result</h1><p>Hello {{.student_name}},</p><p>Your quiz results are ready!</p><p>Score: <strong>{{.score}}/{{.max_score}}</strong></p></div>', 'Quiz result: {{.quiz_title}}. Score: {{.score}}/{{.max_score}}', 'email')
ON CONFLICT (name) DO NOTHING;
SQLEOF

# Check status
sudo docker compose -f docker-compose.prod.yml ps

echo "✅ Deployment completed!"
echo "🌐 Frontend: http://136.110.11.83"
echo "📊 RabbitMQ Management: http://136.110.11.83:15672"
EOF

echo -e "${GREEN}✅ Deployment to server completed successfully!${NC}"
echo -e "${GREEN}🌐 Access your app at: http://136.110.11.83${NC}"
