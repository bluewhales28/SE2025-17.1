# Analytics & Statistic Service

Microservice dành cho phân tích dữ liệu, tạo báo cáo và xuất biểu đồ, PDF cho nền tảng Quiz trực tuyến.

## Tính năng chính

- **Báo cáo & Phân tích**: Thu thập và phân tích dữ liệu từ Quiz Service & Class Service
- **API Báo cáo**: Endpoints để truy xuất báo cáo quiz, học sinh, lớp học, câu hỏi
- **Xuất PDF/CSV**: Xuất báo cáo dạng PDF và CSV
- **Tạo chứng chỉ**: Sinh chứng chỉ hoàn thành quiz/khóa học
- **Phát hiện gian lận**: Phát hiện bất thường và cảnh báo
- **Background Jobs**: Tự động cập nhật thống kê và gửi báo cáo định kỳ

## Công nghệ sử dụng

- **Framework**: FastAPI
- **Database**: PostgreSQL + SQLAlchemy
- **Cache**: Redis
- **Message Queue**: Kafka/RabbitMQ
- **Data Processing**: Pandas, NumPy
- **PDF Generation**: ReportLab, Matplotlib, Plotly
- **Background Tasks**: Celery, APScheduler

## Cài đặt

### Yêu cầu

- Python 3.11+
- PostgreSQL 14+
- Redis 7+
- Kafka hoặc RabbitMQ

### Các bước cài đặt

1. Clone repository và di chuyển vào thư mục:

```bash
cd analytics-service
```

2. Tạo virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Cài đặt dependencies:

```bash
pip install -r requirements.txt
```

4. Tạo file `.env` từ template:

```bash
cp env.example .env
```

5. Cập nhật cấu hình trong file `.env`

6. Chạy database migrations:

```bash
alembic upgrade head
```

7. Khởi động service:

```bash
uvicorn app.main:app --reload --port 8004
```

## API Documentation

Sau khi khởi động service, truy cập:
- Swagger UI: http://localhost:8004/docs
- ReDoc: http://localhost:8004/redoc

## API Endpoints

### Reports

- `GET /api/v1/report/quiz/{id}` - Báo cáo tổng quan cho 1 quiz
- `GET /api/v1/report/student/{id}` - Theo dõi tiến độ học sinh
- `GET /api/v1/report/class/{id}` - Thống kê lớp học
- `GET /api/v1/report/question/{id}` - Phân tích câu hỏi

### Export

- `GET /api/v1/export/pdf` - Xuất báo cáo dạng PDF
- `GET /api/v1/export/csv` - Xuất dữ liệu thô CSV

## Development

### Chạy tests:

```bash
pytest
```

### Chạy tests với coverage:

```bash
pytest --cov=app --cov-report=html
```

### Chạy background workers:

```bash
celery -A app.tasks.celery_app worker --loglevel=info
```

### Chạy scheduled tasks:

```bash
celery -A app.tasks.celery_app beat --loglevel=info
```

## Docker

### Build image:

```bash
docker build -t analytics-service .
```

### Chạy với docker-compose:

```bash
docker-compose up -d
```

## Architecture

Service này sử dụng kiến trúc microservices và giao tiếp với:
- **Quiz Service**: Lấy thông tin quiz và câu hỏi
- **Class Service**: Lấy thông tin lớp học và học sinh
- **Notification Service**: Gửi thông báo và email

## License

MIT License


