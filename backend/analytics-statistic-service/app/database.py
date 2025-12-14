import os
import psycopg2
from psycopg2.extras import RealDictCursor


def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "analytics-db"),
        port=os.getenv("DB_PORT", "5437"),
        dbname=os.getenv("DB_NAME", "analytics_db"),
        user=os.getenv("DB_USER", "analytics_user"),
        password=os.getenv("DB_PASSWORD", "analytics_pass_secure_123"),
        cursor_factory=RealDictCursor
    )
