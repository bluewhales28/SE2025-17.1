package config

import (
	"fmt"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Config holds all application configuration from environment variables.
type Config struct {
	// Database
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

	// Server
	Port string
	Env  string
}

// LoadConfig loads configuration from environment variables.
func LoadConfig() *Config {
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
		Port:          getEnv("PORT", "8080"),
		Env:           getEnv("ENV", "development"),
	}
}

// getEnv retrieves an environment variable with a default fallback value.
func getEnv(key, defaultVal string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultVal
}

// ConnectDB establishes a connection to PostgreSQL database using GORM.
func ConnectDB(cfg *Config) (*gorm.DB, error) {
	// Build PostgreSQL connection string (DSN)
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName,
	)

	// Connect to database
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	return db, nil
}
