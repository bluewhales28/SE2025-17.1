# 🚀 Notification Service - Quick Start Guide

## ✓ Service Status: RUNNING! 

Your Notification Service is now fully functional and ready to test!

---

## 📋 What Was Fixed

✅ **Added godotenv** - Automatically loads environment variables from `.env` file
✅ **Fixed Route Conflicts** - Reorganized API routes to prevent Gin router conflicts  
✅ **Graceful Error Handling** - Migration warnings no longer crash the service
✅ **Database Connection** - Successfully connects to PostgreSQL using credentials from `.env`

---

## 🏃 Quick Start (30 seconds)

### 1. Make sure `.env` file exists with correct credentials:

```bash
cat .env
```

Expected output (verify these values):
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=123456      # ← Your PostgreSQL password
DB_NAME=notification_db
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=luntanson@gmail.com
SMTP_PASSWORD=rfca yvny tdab drdv
TEMPLATE_DIR=templates/email
PORT=8080
ENV=development
```

### 2. Start the service:

```bash
go run main.go
```

You should see:
```
[GIN-debug] Listening and serving HTTP on :8080
```

### 3. In another terminal, test the health endpoint:

```bash
curl http://localhost:8080/health
```

Expected response:
```json
{"status":"ok"}
```

---

## 📡 API Endpoints (Now Fixed!)

### Notifications
- `POST /notifications` - Create notification
- `GET /notifications/user/:user_id` - List user notifications  
- `GET /notifications/user/:user_id/unread/count` - Count unread
- `GET /notifications/:id` - Get notification by ID
- `PUT /notifications/:id/read` - Mark as read
- `PUT /notifications/:id/archive` - Mark as archived
- `DELETE /notifications/:id` - Delete notification

### Preferences
- `GET /preferences/:user_id/:channel` - Get preference
- `DELETE /preferences/:user_id/:channel` - Delete preference
- `PUT /preferences/:user_id` - Update preference
- `GET /preferences/:user_id` - List all preferences

### Templates
- `GET /templates/name/:name` - Get by name
- `GET /templates` - List all
- `POST /templates` - Create template
- `GET /templates/:id` - Get by ID
- `PUT /templates/:id` - Update template
- `DELETE /templates/:id` - Delete template

### Health
- `GET /health` - Service health check

---

## 🧪 Test Examples (Copy & Paste)

### Test 1: Health Check
```bash
curl http://localhost:8080/health
```

### Test 2: Create a Template
```bash
curl -X POST http://localhost:8080/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "welcome",
    "subject": "Welcome {{.Name}}",
    "body_html": "<h1>Welcome {{.Name}}</h1>",
    "body_text": "Welcome {{.Name}}",
    "channel": "email"
  }'
```

### Test 3: Create a Notification (Will send email!)
```bash
curl -X POST http://localhost:8080/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "type": "welcome",
    "title": "Welcome!",
    "content": "Thanks for signing up",
    "channel": "email",
    "metadata": {
      "recipient_email": "luntanson@gmail.com",
      "Name": "Nguyễn Văn A"
    }
  }'
```

### Test 4: List Notifications
```bash
curl http://localhost:8080/notifications/user/1
```

---

## 🐛 Troubleshooting

### Service won't start
1. Check PostgreSQL is running: `psql -U postgres`
2. Verify .env file exists and has correct credentials
3. Check port 8080 is not in use: `netstat -an | grep 8080`

### Can't connect to database
Check your PostgreSQL password:
```bash
psql -U postgres -d notification_db
```

### Routes not working
Make sure service is running on port 8080:
```bash
curl http://localhost:8080/health
```

---

## 📚 Next Steps

1. **Use Postman** to test all endpoints (easier than curl)
2. **Check database** to see saved data:
   ```bash
   psql -U postgres -d notification_db
   SELECT * FROM notifications;
   ```
3. **Check email** inbox for sent notifications
4. **Read full guide** in `HUONG_DAN_TEST_CHI_TIET.txt`

---

## 🎉 You're All Set!

Your Notification Service is ready to use. Happy testing! 🚀
