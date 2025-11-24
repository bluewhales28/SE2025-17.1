// Updated config.go
package config

import (
    "fmt"
    "os"

    "github.com/joho/godotenv"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

// Config chứa tất cả cấu hình ứng dụng từ các biến môi trường.
type Config struct {
    // Cơ sở dữ liệu
    DBHost     string
    DBPort     string
    DBUser     string
    DBPassword string
    DBName     string

    // RabbitMQ
    RabbitMQURL string

    // Email
    EmailProvider string
    SMTPHost      string
    SMTPPort      string
    SMTPUser      string
    SMTPPassword  string

    // Mẫu email
    TemplateDir string

    // Máy chủ
    Port string
    Env  string
}

// LoadConfig tải cấu hình từ file .env (nếu tồn tại) hoặc từ các biến môi trường hệ thống.
func LoadConfig() *Config {
    // Cố gắng tải file .env nếu tồn tại (không bắt lỗi nếu không có)
    // Điều này cho phép sử dụng biến môi trường hệ thống nếu .env không tồn tại
    _ = godotenv.Load()

    return &Config{
        DBHost:        getEnv("DB_HOST", "localhost"),
        DBPort:        getEnv("DB_PORT", "5432"),
        DBUser:        getEnv("DB_USER", "postgres"),
        DBPassword:    getEnv("DB_PASSWORD", "password"),
        DBName:        getEnv("DB_NAME", "notification_db"),
        RabbitMQURL:   getEnv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/"),
        EmailProvider: getEnv("EMAIL_PROVIDER", "smtp"),
        SMTPHost:      getEnv("SMTP_HOST", "smtp.gmail.com"),
        SMTPPort:      getEnv("SMTP_PORT", "587"),
        SMTPUser:      getEnv("SMTP_USER", ""),
        SMTPPassword:  getEnv("SMTP_PASSWORD", ""),
        TemplateDir:   getEnv("TEMPLATE_DIR", "templates/email"),
        Port:          getEnv("PORT", "8080"),
        Env:           getEnv("ENV", "development"),
    }
}

// getEnv truy xuất một biến môi trường với giá trị mặc định dự phòng.
// Trước tiên kiểm tra biến môi trường hệ thống, sau đó sử dụng giá trị mặc định.
func getEnv(key, defaultVal string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultVal
}

// ConnectDB thiết lập kết nối tới cơ sở dữ liệu PostgreSQL bằng GORM.
func ConnectDB(cfg *Config) (*gorm.DB, error) {
    // Xây dựng chuỗi kết nối PostgreSQL (DSN - Data Source Name)
    // Format: host=<host> port=<port> user=<user> password=<password> dbname=<name> sslmode=disable
    dsn := fmt.Sprintf(
        "host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
        cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName,
    )

    // Kết nối tới cơ sở dữ liệu sử dụng GORM
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        return nil, fmt.Errorf("failed to connect to database: %w", err)
    }

    return db, nil
}