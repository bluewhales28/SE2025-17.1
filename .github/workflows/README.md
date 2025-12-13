# 🚀 CI/CD Workflows Documentation

## 📋 Tổng quan

Project này sử dụng **GitHub Actions** để tự động hóa quy trình CI/CD cho tất cả các services.

### Danh sách Services

| Service | Language | Workflow File |
|---------|----------|---------------|
| User Auth Service | Java 17 (Spring Boot) | `user-auth-service-ci-cd.yml` |
| Notification Service | Go 1.23 | `notification-service-ci-cd.yml` |
| Quiz Service | Go 1.23 | `quiz-service-ci-cd.yml` |
| Analytics Service | Python 3.11 (FastAPI) | `analytics-service-ci-cd.yml` |
| Class Assignment Service | Java 17 (Spring Boot) | `class-assignment-service-ci-cd.yml` |
| Frontend | Next.js 20 | `frontend-ci-cd.yml` |

---

## 🔄 Flow Tổng Quan

```
┌─────────────────────────────────────────────────────────────────┐
│                        FEATURE BRANCH                            │
│  Push code → Lint → Test → Build → Security Scan                │
│  (Không build Docker, không deploy)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          DEV BRANCH                              │
│  Push code → Lint → Test → Build → Security → Docker → Deploy  │
│  (Deploy lên môi trường Development)                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         MAIN BRANCH                              │
│  Push code → Lint → Test → Build → Security → Docker → Deploy  │
│  (Deploy lên môi trường Production + Health Check)              │
└─────────────────────────────────────────────────────────────────┘
```

---

## ☕ User Auth Service (Java)

**File:** `user-auth-service-ci-cd.yml`  
**Path:** `backend/user-auth-service/`  
**Trigger:** Push/PR vào `main`, `dev`, `feature/**`

### Jobs

```
┌─────────┐     ┌──────────────┐     ┌───────────────┐
│  build  │────►│ code-quality │     │ security-scan │
└────┬────┘     └──────────────┘     └───────┬───────┘
     │                                        │
     └──────────────────┬─────────────────────┘
                        ▼
                   ┌─────────┐
                   │ docker  │
                   └────┬────┘
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
    ┌────────────┐             ┌──────────────────┐
    │ deploy-dev │             │ deploy-production│
    └────────────┘             └──────────────────┘
```

| Job | Nhiệm vụ | Chi tiết |
|-----|----------|----------|
| **build** | Build & Test | Compile code, chạy unit tests, tạo JAR file |
| **code-quality** | Kiểm tra chất lượng code | SpotBugs (tìm bugs), Checkstyle (coding standards) |
| **security-scan** | Quét bảo mật | Trivy scanner tìm vulnerabilities |
| **docker** | Build Docker image | Build và push image lên GitHub Container Registry |
| **deploy-dev** | Deploy Development | SSH vào server dev, pull image mới, restart container |
| **deploy-production** | Deploy Production | SSH vào server prod, pull image mới, restart container |

### Steps trong job `build`:

1. ✅ Checkout code
2. ✅ Setup JDK 17
3. ✅ Cache Maven packages
4. ✅ `chmod +x ./mvnw` - Cấp quyền execute
5. ✅ `./mvnw clean compile` - Compile code
6. ✅ `./mvnw test` - Chạy unit tests
7. ✅ `./mvnw package` - Tạo JAR file
8. ✅ Upload artifact

---

## 📧 Notification Service (Go)

**File:** `notification-service-ci-cd.yml`  
**Path:** `backend/notification-service/`  
**Trigger:** Push/PR vào `main`, `dev`, `feature/**`

### Jobs

```
┌──────┐     ┌──────┐     ┌───────────────┐
│ lint │────►│ test │     │ security-scan │
└──────┘     └──┬───┘     └───────┬───────┘
                │                  │
                ▼                  │
            ┌───────┐              │
            │ build │◄─────────────┘
            └───┬───┘
                │
                ▼
           ┌─────────┐
           │ docker  │
           └────┬────┘
                │
     ┌──────────┴──────────┐
     ▼                     ▼
┌────────────┐      ┌──────────────────┐
│ deploy-dev │      │ deploy-production│
└────────────┘      └──────────────────┘
```

| Job | Nhiệm vụ | Chi tiết |
|-----|----------|----------|
| **lint** | Kiểm tra code style | `go vet`, `go fmt`, `golangci-lint` |
| **test** | Chạy tests | Unit tests với coverage report |
| **build** | Build binary | Compile Go binary cho Linux AMD64 |
| **security-scan** | Quét bảo mật | Gosec (Go security), Trivy scanner |
| **docker** | Build Docker image | Build và push lên GHCR |
| **deploy-dev** | Deploy Development | SSH deploy |
| **deploy-production** | Deploy Production | SSH deploy |

### Steps trong job `lint`:

1. ✅ Checkout code
2. ✅ Setup Go 1.23
3. ✅ `go mod download` - Download dependencies
4. ✅ `go mod verify` - Verify dependencies
5. ✅ `go vet ./...` - Kiểm tra code issues
6. ✅ `gofmt -s -l .` - Kiểm tra format code
7. ✅ `golangci-lint` - Chạy nhiều linters

---

## 📝 Quiz Service (Go)

**File:** `quiz-service-ci-cd.yml`  
**Path:** `backend/quiz-service/`  
**Trigger:** Push/PR vào `main`, `dev`, `feature/**`

### Jobs

*(Tương tự Notification Service)*

| Job | Nhiệm vụ | Ghi chú |
|-----|----------|---------|
| **lint** | Kiểm tra code style | + `go mod tidy` để tạo go.sum nếu thiếu |
| **test** | Chạy tests | Unit tests với coverage |
| **build** | Build binary | CGO_ENABLED=0 cho static binary |
| **security-scan** | Quét bảo mật | Gosec + Trivy |
| **docker** | Build Docker image | Push lên GHCR |
| **deploy-*** | Deploy | SSH deploy |

---

## 📊 Analytics Service (Python)

**File:** `analytics-service-ci-cd.yml`  
**Path:** `backend/analytics-statistic-service/`  
**Trigger:** Push/PR vào `main`, `dev`, `feature/**`

### Jobs

```
┌──────┐     ┌──────┐     ┌───────────────┐
│ lint │────►│ test │     │ security-scan │
└──────┘     └──┬───┘     └───────┬───────┘
                │                  │
                └────────┬─────────┘
                         ▼
                    ┌─────────┐
                    │ docker  │
                    └────┬────┘
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
    ┌────────────┐               ┌──────────────────┐
    │ deploy-dev │               │ deploy-production│
    └────────────┘               └──────────────────┘
```

| Job | Nhiệm vụ | Chi tiết |
|-----|----------|----------|
| **lint** | Kiểm tra code style | `flake8` (linting), `black` (formatting), `isort` (imports) |
| **test** | Chạy tests | `pytest` với coverage report |
| **security-scan** | Quét bảo mật | `bandit` (Python security), `safety` (dependencies), Trivy |
| **docker** | Build Docker image | Push lên GHCR |
| **deploy-*** | Deploy | SSH deploy |

### Steps trong job `lint`:

1. ✅ Checkout code
2. ✅ Setup Python 3.11
3. ✅ Install flake8, black, isort
4. ✅ `flake8 app --select=E9,F63,F7,F82` - Kiểm tra syntax errors
5. ✅ `flake8 app` - Kiểm tra style
6. ✅ `black --check app` - Kiểm tra code formatting
7. ✅ `isort --check-only app` - Kiểm tra import sorting

---

## 📚 Class Assignment Service (Java)

**File:** `class-assignment-service-ci-cd.yml`  
**Path:** `backend/class-assignment-service/`  
**Trigger:** Push/PR vào `main`, `dev`, `feature/**`

### Jobs

*(Tương tự User Auth Service)*

| Job | Nhiệm vụ | Chi tiết |
|-----|----------|----------|
| **build** | Build & Test | Maven compile, test, package |
| **code-quality** | Kiểm tra chất lượng | SpotBugs, Checkstyle |
| **security-scan** | Quét bảo mật | Trivy |
| **docker** | Build Docker image | Push lên GHCR |
| **deploy-*** | Deploy | SSH deploy |

---

## 🌐 Frontend (Next.js)

**File:** `frontend-ci-cd.yml`  
**Path:** `frontend/`  
**Trigger:** Push/PR vào `main`, `dev`, `feature/**`

### Jobs

```
┌──────┐     ┌──────┐     ┌───────┐     ┌───────────────┐
│ lint │────►│ test │────►│ build │     │ security-scan │
└──────┘     └──────┘     └───┬───┘     └───────┬───────┘
                              │                  │
                              └────────┬─────────┘
                                       ▼
                                  ┌─────────┐
                                  │ docker  │
                                  └────┬────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
              ┌────────────┐                       ┌──────────────────┐
              │ deploy-dev │                       │ deploy-production│
              └────────────┘                       └──────────────────┘
```

| Job | Nhiệm vụ | Chi tiết |
|-----|----------|----------|
| **lint** | Kiểm tra code | ESLint, TypeScript check |
| **test** | Chạy tests | Jest tests (nếu có) |
| **build** | Build app | `npm run build` - Build Next.js |
| **security-scan** | Quét bảo mật | `npm audit`, Trivy |
| **docker** | Build Docker image | Push lên GHCR |
| **deploy-*** | Deploy | SSH deploy |

### Steps trong job `lint`:

1. ✅ Checkout code
2. ✅ Setup Node.js 20
3. ✅ `npm ci` - Install dependencies
4. ✅ `npm run lint` - ESLint
5. ✅ `npx tsc --noEmit` - TypeScript type check

---

## 📈 All Services Summary

**File:** `all-services-ci-cd.yml`

Workflow này chạy mỗi khi có push và:
- Detect services nào thay đổi
- Hiển thị summary table trên GitHub Actions

---

## 🔐 GitHub Secrets Cần Thiết

| Secret | Mô tả | Dùng cho |
|--------|-------|----------|
| `DEV_HOST` | IP/domain server development | Deploy |
| `DEV_USERNAME` | SSH username (vd: azureuser) | Deploy |
| `DEV_SSH_KEY` | SSH private key | Deploy |
| `PROD_HOST` | IP/domain server production | Deploy |
| `PROD_USERNAME` | SSH username | Deploy |
| `PROD_SSH_KEY` | SSH private key | Deploy |
| `GITHUB_TOKEN` | Auto-generated | Push Docker images |

---

## 🐳 Docker Images

Tất cả images được push lên **GitHub Container Registry (GHCR)**:

```
ghcr.io/{owner}/{repo}/user-auth-service:{branch}
ghcr.io/{owner}/{repo}/notification-service:{branch}
ghcr.io/{owner}/{repo}/quiz-service:{branch}
ghcr.io/{owner}/{repo}/analytics-service:{branch}
ghcr.io/{owner}/{repo}/class-assignment-service:{branch}
ghcr.io/{owner}/{repo}/frontend:{branch}
```

### Tags:
- `main` - Production build
- `dev` - Development build
- `{branch}-{sha}` - Specific commit

---

## 📝 Lưu ý

1. **Feature branches** chỉ chạy CI (lint, test, build) - không deploy
2. **Dev branch** deploy lên môi trường Development
3. **Main branch** deploy lên môi trường Production
4. Tất cả workflows fail ngay khi có lỗi (không continue-on-error)
5. Docker images được cache để build nhanh hơn

