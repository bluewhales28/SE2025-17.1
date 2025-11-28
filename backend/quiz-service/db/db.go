package db

import (
	"fmt"
	"log"
	"os"

	"github.com/bluewhales28/quiz-service/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Ho_Chi_Minh",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	// Auto Migrate
	err = database.AutoMigrate(&models.Quiz{}, &models.Question{}, &models.Answer{}, &models.QuizAttempt{})
	if err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}

	DB = database
}
