# CI/CD Pipeline Documentation

## 📋 Tổng quan

Dự án sử dụng **GitHub Actions** để tự động hóa quy trình CI/CD cho tất cả các backend microservices. Mỗi service có workflow riêng biệt với các bước kiểm tra, build, và deploy.

## 🏗️ Kiến trúc CI/CD

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   main     │  │    dev     │  │  feature/* │            │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘            │
└─────────┼────────────────┼────────────────┼──────────────────┘
          │                │                │
          │                │                │
          ▼                ▼                ▼
┌──────────────────────────────────────────────────────────────┐
│                    GitHub Actions                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Lint     │  │   Test     │  │  Security  │            │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘            │
│         └────────────────┴────────────────┘                  │
│                         │                                     │
│                         ▼                                     │
│                  ┌────────────┐                              │
│                  │   Build    │                              │
│                  └──────┬─────┘                              │
│                         │                                     │
│                         ▼                                     │
│              ┌──────────────────────┐                        │
│              │  Push to Registry    │                        │
│              └──────────┬───────────┘                        │
│                         │                                     │
│         ┌───────────────┴───────────────┐                   │
│         ▼                               ▼                    │
│  ┌──────────────┐              ┌──────────────┐            │
│  │Deploy to Dev │              │Deploy to Prod│            │
│  └──────────────┘              └──────────────┘            │
└──────────────────────────────────────────────────────────────┘
```

## 🔧 Services CI/CD

### 1. Analytics Service (Python/FastAPI)
- **File**: `.github/workflows/analytics-service-ci-cd.yml`
- **Language**: Python 3.11
- **Framework**: FastAPI
- **Linting**: flake8, black, isort
- **Testing**: pytest với coverage
- **Security**: bandit, safety

### 2. Auth Service (Java Spring Boot)
- **File**: `.github/workflows/auth-service-ci-cd.yml`
- **Language**: Java 17
- **Framework**: Spring Boot
- **Build Tool**: Maven
- **Linting**: Checkstyle, PMD, SpotBugs
- **Testing**: JUnit, Jacoco
- **Security**: OWASP Dependency Check
- **Code Quality**: SonarQube

### 3. Quiz Service (Golang)
- **File**: `.github/workflows/quiz-service-ci-cd.yml`
- **Language**: Go 1.21
- **Linting**: golangci-lint, staticcheck
- **Testing**: go test với race detector
- **Security**: Gosec, Trivy

### 4. Submission Service (Java Spring Boot)
- **File**: `.github/workflows/submission-service-ci-cd.yml`
- **Language**: Java 17
- **Framework**: Spring Boot
- **Build Tool**: Maven
- **Linting**: Checkstyle
- **Testing**: JUnit, Jacoco
- **Security**: OWASP Dependency Check

### 5. Notification Service (Golang)
- **File**: `.github/workflows/notification-service-ci-cd.yml`
- **Language**: Go 1.21
- **Linting**: golangci-lint
- **Testing**: go test với coverage
- **Security**: Gosec

## 📊 Workflow Steps

### Giai đoạn 1: Lint & Test
```yaml
- Checkout code
- Setup language environment
- Install dependencies
- Run linters
- Run unit tests
- Run integration tests
- Generate coverage report
- Upload coverage to Codecov
```

### Giai đoạn 2: Security Scan
```yaml
- Security vulnerability scanning
- Dependency checking
- Code security analysis
- Upload results to GitHub Security
```

### Giai đoạn 3: Build & Push
```yaml
- Build application
- Build Docker image
- Tag image
- Push to Container Registry (GitHub Container Registry)
```

### Giai đoạn 4: Deploy
```yaml
- Deploy to Development (dev branch)
- Deploy to Production (main branch)
- Health check
- Send notification
```

## 🔐 GitHub Secrets cần thiết

### Development Environment
```
DEV_HOST              # Development server hostname
DEV_USERNAME          # SSH username
DEV_SSH_KEY          # SSH private key
```

### Production Environment
```
PROD_HOST             # Production server hostname
PROD_USERNAME         # SSH username
PROD_SSH_KEY         # SSH private key
```

### External Services
```
SONAR_TOKEN          # SonarQube token (cho Java services)
SONAR_HOST_URL       # SonarQube server URL
SLACK_WEBHOOK        # Slack webhook URL for notifications
CODECOV_TOKEN        # Codecov token (optional)
```

## 🚀 Cách sử dụng

### Push code lên branch
```bash
# Feature branch
git checkout -b feature/ten-tinh-nang
git add .
git commit -m "feat: mô tả tính năng"
git push origin feature/ten-tinh-nang

# Dev branch
git checkout dev
git merge feature/ten-tinh-nang
git push origin dev  # Auto deploy to Development

# Main branch
git checkout main
git merge dev
git push origin main  # Auto deploy to Production
```

### Trigger manually
1. Vào tab **Actions** trên GitHub
2. Chọn workflow muốn chạy
3. Click **Run workflow**
4. Chọn branch và click **Run workflow**

## 📝 Branch Strategy

```
main (production)
  ↑
  │ (PR + Review)
  │
dev (development)
  ↑
  │ (PR)
  │
feature/* (features)
```

### Quy tắc:
- **feature/\***: Nhánh phát triển tính năng
- **dev**: Nhánh tích hợp và test
- **main**: Nhánh production

## 🔄 Deployment Strategy

### Development (dev branch)
- **Trigger**: Push to `dev` branch
- **Environment**: Development server
- **Approval**: Không cần
- **Rollback**: Tự động

### Production (main branch)
- **Trigger**: Push to `main` branch
- **Environment**: Production server
- **Approval**: Manual (recommended)
- **Rollback**: Manual
- **Health Check**: Bắt buộc

## 📦 Docker Registry

Services sử dụng **GitHub Container Registry** (ghcr.io):
- `ghcr.io/{username}/analytics-service:latest`
- `ghcr.io/{username}/auth-service:latest`
- `ghcr.io/{username}/quiz-service:latest`
- `ghcr.io/{username}/submission-service:latest`
- `ghcr.io/{username}/notification-service:latest`

## 🔔 Notifications

### Slack Integration
Thông báo được gửi khi:
- ✅ Deployment thành công
- ❌ Deployment thất bại
- ⚠️ Security issues phát hiện

### Email Notifications
GitHub tự động gửi email khi:
- Workflow fails
- Required checks fail

## 📈 Monitoring & Reporting

### Code Coverage
- **Tool**: Codecov
- **Target**: > 80%
- **Badge**: Hiển thị trên README

### Code Quality
- **Tool**: SonarQube (Java services)
- **Metrics**: Code smells, bugs, vulnerabilities
- **Quality Gate**: Must pass

### Security Scanning
- **Java**: OWASP Dependency Check
- **Go**: Gosec, Trivy
- **Python**: Bandit, Safety
- **Results**: GitHub Security tab

## 🛠️ Local Testing

### Test workflows locally
```bash
# Install act
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run workflow
act -j lint-and-test
```

### Test Docker build
```bash
cd <service-directory>
docker build -t test-image .
docker run -p 8080:8080 test-image
```

## 🐛 Troubleshooting

### Workflow fails
1. Check logs trong Actions tab
2. Verify secrets đã được set
3. Check dependencies version
4. Test locally

### Deployment fails
1. Check server connectivity
2. Verify SSH keys
3. Check docker-compose.yml
4. Check server disk space

### Tests fail
1. Run tests locally
2. Check test dependencies
3. Verify test environment variables
4. Check database connections

## 📚 Best Practices

1. **Commit messages**: Sử dụng conventional commits
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation
   - `test:` - Tests
   - `refactor:` - Code refactoring

2. **Pull Requests**: 
   - Require code review
   - Require passing CI checks
   - Squash commits khi merge

3. **Testing**:
   - Viết tests cho mọi tính năng mới
   - Maintain coverage > 80%
   - Run tests trước khi push

4. **Security**:
   - Không commit secrets
   - Regular dependency updates
   - Review security scan results

## 🔄 Maintenance

### Weekly
- Review failed workflows
- Update dependencies
- Check security alerts

### Monthly
- Review and optimize workflows
- Update GitHub Actions versions
- Cleanup old Docker images

### Quarterly
- Review deployment strategy
- Update documentation
- Performance optimization

## 📖 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 📞 Support

Nếu có vấn đề với CI/CD pipeline:
1. Check documentation này
2. Review workflow logs
3. Contact DevOps team
4. Create issue trên GitHub

---

**Cập nhật lần cuối**: 2025-11-29
**Maintainer**: DevOps Team





