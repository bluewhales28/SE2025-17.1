# 📊 Monitoring & Logging Stack

Hệ thống giám sát và thu thập log cho Quiz Platform sử dụng **Prometheus**, **Grafana**, **Loki**, và **Alertmanager**.

## 🏗️ Kiến trúc

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MONITORING STACK                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌──────────────┐                 │
│  │ Prometheus  │───►│   Grafana   │◄───│     Loki     │                 │
│  │  :9090      │    │   :3001     │    │    :3100     │                 │
│  └──────┬──────┘    └─────────────┘    └──────┬───────┘                 │
│         │                                      │                         │
│         │ scrape                        push logs                        │
│         ▼                                      │                         │
│  ┌─────────────┐    ┌─────────────┐    ┌──────┴───────┐                 │
│  │    Node     │    │   cAdvisor  │    │   Promtail   │                 │
│  │  Exporter   │    │   :8080     │    │              │                 │
│  │   :9100     │    └──────┬──────┘    └──────┬───────┘                 │
│  └──────┬──────┘           │                  │                         │
│         │                  │                  │                         │
│         └────────┬─────────┴──────────────────┘                         │
│                  ▼                                                       │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    YOUR SERVICES (Containers)                     │   │
│  │  user-auth │ notification │ quiz │ analytics │ class-assignment  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────┐                                                        │
│  │Alertmanager │──────► Slack / Email / Webhook                         │
│  │   :9093     │                                                        │
│  └─────────────┘                                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 📁 Cấu trúc thư mục

```
devops/monitoring/
├── docker-compose.yml              # Main stack definition
├── README.md                       # This file
│
├── prometheus/
│   ├── prometheus.yml              # Prometheus configuration
│   └── alert-rules.yml             # Alert rules
│
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/
│   │   │   └── datasources.yml     # Auto-configure datasources
│   │   └── dashboards/
│   │       └── dashboards.yml      # Dashboard provider config
│   └── dashboards/
│       └── overview.json           # Pre-built dashboard
│
├── loki/
│   └── loki-config.yml             # Loki configuration
│
├── promtail/
│   └── promtail-config.yml         # Promtail configuration
│
└── alertmanager/
    └── alertmanager.yml            # Alertmanager configuration
```

## 🚀 Cách sử dụng

### 1. Khởi động stack

```bash
cd devops/monitoring

# Start all services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Xem status
docker-compose ps
```

### 2. Truy cập các services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Grafana** | http://localhost:3001 | admin / admin123 |
| **Prometheus** | http://localhost:9090 | - |
| **Alertmanager** | http://localhost:9093 | - |
| **Loki** | http://localhost:3100 | - |
| **cAdvisor** | http://localhost:8080 | - |

### 3. Dừng stack

```bash
docker-compose down

# Xóa cả data
docker-compose down -v
```

## 📊 Components

### Prometheus (Metrics)
- Thu thập metrics từ các services
- Lưu trữ time-series data
- Evaluate alert rules
- **Port:** 9090

### Grafana (Visualization)
- Dashboards cho metrics và logs
- Query Prometheus và Loki
- Alert visualization
- **Port:** 3001

### Loki (Log Aggregation)
- Thu thập và lưu trữ logs
- Query logs như Prometheus
- **Port:** 3100

### Promtail (Log Collector)
- Đọc logs từ containers
- Push logs đến Loki
- **Port:** 9080

### Alertmanager (Alerts)
- Xử lý alerts từ Prometheus
- Route alerts đến các channels
- **Port:** 9093

### Node Exporter (Host Metrics)
- Thu thập metrics từ host
- CPU, Memory, Disk, Network
- **Port:** 9100

### cAdvisor (Container Metrics)
- Thu thập metrics từ Docker containers
- Resource usage per container
- **Port:** 8080

## 🔔 Alerts

### Các alert rules có sẵn:

| Alert | Severity | Trigger |
|-------|----------|---------|
| HighCPUUsage | warning | CPU > 80% trong 5 phút |
| CriticalCPUUsage | critical | CPU > 95% trong 2 phút |
| HighMemoryUsage | warning | Memory > 85% trong 5 phút |
| CriticalMemoryUsage | critical | Memory > 95% trong 2 phút |
| HighDiskUsage | warning | Disk > 80% trong 5 phút |
| CriticalDiskUsage | critical | Disk > 90% trong 2 phút |
| ContainerDown | critical | Container không chạy |
| ContainerRestarting | warning | Container restart > 3 lần/15 phút |
| ServiceDown | critical | Service không respond |

### Cấu hình Slack alerts

1. Tạo Slack Webhook: https://api.slack.com/messaging/webhooks
2. Sửa file `alertmanager/alertmanager.yml`:

```yaml
receivers:
  - name: 'critical-receiver'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
        channel: '#alerts-critical'
        send_resolved: true
```

3. Restart Alertmanager:
```bash
docker-compose restart alertmanager
```

## 📈 Grafana Dashboards

### Pre-installed
- **Quiz Platform - Overview**: Tổng quan hệ thống

### Recommended (Import by ID)
| Dashboard ID | Name | Description |
|--------------|------|-------------|
| 1860 | Node Exporter Full | Chi tiết host metrics |
| 893 | Docker Container | Container metrics |
| 13639 | Loki Dashboard | Log analysis |

**Import:** Grafana → Dashboards → Import → Nhập ID

## 🔧 Tích hợp với Services

### Spring Boot (Java)

Thêm dependency:
```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

application.yml:
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
```

### Go

```go
import "github.com/prometheus/client_golang/prometheus/promhttp"

http.Handle("/metrics", promhttp.Handler())
```

### Python (FastAPI)

```python
from prometheus_fastapi_instrumentator import Instrumentator

Instrumentator().instrument(app).expose(app)
```

## 📝 Queries hữu ích

### Prometheus (PromQL)

```promql
# CPU usage
100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# Container memory
container_memory_usage_bytes{name!=""}

# HTTP request rate
rate(http_requests_total[5m])

# HTTP error rate
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100
```

### Loki (LogQL)

```logql
# All logs from a service
{service="user-auth-service"}

# Error logs
{job="containerlogs"} |= "ERROR"

# Filter by level
{service="notification-service"} | json | level="error"

# Count errors per service
sum by(service) (count_over_time({job="containerlogs"} |= "ERROR" [5m]))
```

## 🛠️ Troubleshooting

### Prometheus không scrape được service

1. Kiểm tra service có expose metrics endpoint không
2. Kiểm tra network connectivity:
```bash
docker exec prometheus wget -qO- http://service-name:port/metrics
```

### Logs không hiện trong Loki

1. Kiểm tra Promtail có chạy không:
```bash
docker-compose logs promtail
```

2. Kiểm tra Promtail config path có đúng không

### Grafana không connect được datasource

1. Kiểm tra Prometheus/Loki có chạy không
2. Kiểm tra URL trong datasource config

## 📚 Tài liệu tham khảo

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/)
- [Alertmanager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)

