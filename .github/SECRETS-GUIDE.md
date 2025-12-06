# GitHub Secrets Configuration Guide

## 📝 Hướng dẫn cấu hình Secrets

GitHub Secrets được sử dụng để lưu trữ thông tin nhạy cảm như credentials, API keys, và tokens.

## 🔐 Cách thêm Secrets

### 1. Repository Secrets
```
1. Vào Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Nhập Name và Value
4. Click "Add secret"
```

### 2. Environment Secrets
```
1. Vào Settings → Environments
2. Tạo environment: development, production
3. Add secrets cho từng environment
```

## 📋 Danh sách Secrets cần thiết

### Development Environment

#### SSH Connection
```
Name: DEV_HOST
Value: dev.your-domain.com hoặc IP address
Description: Development server hostname/IP

Name: DEV_USERNAME
Value: deploy-user
Description: SSH username cho development server

Name: DEV_SSH_KEY
Value: -----BEGIN OPENSSH PRIVATE KEY-----
       ...
       -----END OPENSSH PRIVATE KEY-----
Description: SSH private key cho development server
```

**Cách tạo SSH key:**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "github-actions-dev" -f ~/.ssh/github-actions-dev

# Copy private key (paste vào DEV_SSH_KEY)
cat ~/.ssh/github-actions-dev

# Copy public key lên server
ssh-copy-id -i ~/.ssh/github-actions-dev.pub user@dev-server
```

### Production Environment

#### SSH Connection
```
Name: PROD_HOST
Value: prod.your-domain.com hoặc IP address
Description: Production server hostname/IP

Name: PROD_USERNAME
Value: deploy-user
Description: SSH username cho production server

Name: PROD_SSH_KEY
Value: -----BEGIN OPENSSH PRIVATE KEY-----
       ...
       -----END OPENSSH PRIVATE KEY-----
Description: SSH private key cho production server
```

### External Services

#### SonarQube (cho Java services)
```
Name: SONAR_TOKEN
Value: squ_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Description: SonarQube authentication token

Name: SONAR_HOST_URL
Value: https://sonarqube.your-domain.com
Description: SonarQube server URL
```

**Cách lấy SonarQube token:**
```
1. Login vào SonarQube
2. My Account → Security
3. Generate Token
4. Copy token
```

#### Codecov (Optional)
```
Name: CODECOV_TOKEN
Value: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Description: Codecov upload token
```

**Cách lấy Codecov token:**
```
1. Login vào codecov.io
2. Add repository
3. Copy token từ Settings
```

#### Slack Notifications
```
Name: SLACK_WEBHOOK
Value: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
Description: Slack webhook URL for deployment notifications
```

**Cách tạo Slack webhook:**
```
1. Vào Slack App Directory
2. Search "Incoming Webhooks"
3. Add to Slack
4. Choose channel
5. Copy Webhook URL
```

#### Docker Registry (GitHub Container Registry)
```
Name: GITHUB_TOKEN
Value: Tự động cung cấp bởi GitHub Actions
Description: Không cần thêm manually
```

### Database Credentials (cho deployment)

#### Development Database
```
Name: DEV_DB_HOST
Value: dev-db.your-domain.com
Description: Development database host

Name: DEV_DB_USER
Value: db_user
Description: Development database username

Name: DEV_DB_PASSWORD
Value: secure_password_here
Description: Development database password

Name: DEV_DB_NAME
Value: quiz_db_dev
Description: Development database name
```

#### Production Database
```
Name: PROD_DB_HOST
Value: prod-db.your-domain.com
Description: Production database host

Name: PROD_DB_USER
Value: db_user
Description: Production database username

Name: PROD_DB_PASSWORD
Value: secure_password_here
Description: Production database password

Name: PROD_DB_NAME
Value: quiz_db_prod
Description: Production database name
```

### Service-specific Secrets

#### Analytics Service
```
Name: AWS_ACCESS_KEY_ID
Value: AKIAIOSFODNN7EXAMPLE
Description: AWS access key for S3 (reports storage)

Name: AWS_SECRET_ACCESS_KEY
Value: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Description: AWS secret key

Name: AWS_REGION
Value: us-east-1
Description: AWS region
```

#### Notification Service
```
Name: SENDGRID_API_KEY
Value: SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Description: SendGrid API key for email sending

Name: FIREBASE_SERVICE_ACCOUNT
Value: { "type": "service_account", ... }
Description: Firebase service account JSON for push notifications
```

#### Auth Service
```
Name: JWT_SECRET
Value: your-super-secret-jwt-key-change-in-production
Description: JWT signing secret key

Name: OAUTH_GOOGLE_CLIENT_ID
Value: xxxxx.apps.googleusercontent.com
Description: Google OAuth client ID

Name: OAUTH_GOOGLE_CLIENT_SECRET
Value: GOCSPX-xxxxxxxxxxxxxxxxxxxxx
Description: Google OAuth client secret
```

## 🔒 Security Best Practices

### 1. Rotation Policy
```
- SSH keys: Rotate every 6 months
- API tokens: Rotate every 3 months
- Passwords: Rotate every month
- JWT secrets: Rotate every 6 months
```

### 2. Access Control
```
- Limit who can view/edit secrets
- Use environment-specific secrets
- Principle of least privilege
- Audit secret access regularly
```

### 3. Secret Management
```
- Never commit secrets to repository
- Use .env files locally (add to .gitignore)
- Use secret scanning tools
- Monitor for exposed secrets
```

## 📋 Verification Checklist

```markdown
- [ ] Development SSH credentials added
- [ ] Production SSH credentials added
- [ ] SonarQube token configured (Java services)
- [ ] Codecov token configured
- [ ] Slack webhook configured
- [ ] Database credentials added
- [ ] Service-specific secrets added
- [ ] All secrets tested
- [ ] Documentation updated
```

## 🧪 Testing Secrets

### Test SSH Connection
```bash
# From GitHub Actions runner
ssh -i $DEV_SSH_KEY $DEV_USERNAME@$DEV_HOST "echo 'Connection successful'"
```

### Test Database Connection
```bash
# PostgreSQL
PGPASSWORD=$DEV_DB_PASSWORD psql -h $DEV_DB_HOST -U $DEV_DB_USER -d $DEV_DB_NAME -c "SELECT 1"
```

### Test API Keys
```bash
# Test Slack webhook
curl -X POST $SLACK_WEBHOOK \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test notification from CI/CD"}'
```

## 🔍 Troubleshooting

### Secret not found
```
Error: Secret DEV_HOST not found
Solution: Kiểm tra tên secret đúng (case-sensitive)
```

### Invalid SSH key
```
Error: Permission denied (publickey)
Solution: 
1. Verify SSH key format
2. Check public key trên server
3. Test connection manually
```

### Database connection failed
```
Error: Connection refused
Solution:
1. Check database host/port
2. Verify credentials
3. Check firewall rules
```

## 📚 Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [SSH Key Management](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- [Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

## 🔄 Migration from Other CI/CD

### From GitLab CI
```yaml
# GitLab variable → GitHub secret
$DEV_HOST → ${{ secrets.DEV_HOST }}
```

### From Jenkins
```yaml
# Jenkins credential → GitHub secret
credentials('dev-ssh-key') → ${{ secrets.DEV_SSH_KEY }}
```

### From CircleCI
```yaml
# CircleCI environment → GitHub secret
$DEV_HOST → ${{ secrets.DEV_HOST }}
```

---

**Note**: Thay đổi tất cả placeholder values bằng values thực tế của bạn!





