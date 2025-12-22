import os

DB_HOST = os.getenv("DB_HOST", "postgres")
DB_PORT = int(os.getenv("DB_PORT", 5432))
DB_NAME = os.getenv("DB_NAME", "quizz")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
ANALYTICS_QUEUE = "analytics.all"

CACHE_TTL_SECONDS = 300

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL")
CLASS_SERVICE_URL = os.getenv("CLASS_SERVICE_URL")

JWT_SECRET = os.getenv("JWT_SECRET", "secret")
JWT_ALGORITHM = "HS256"
