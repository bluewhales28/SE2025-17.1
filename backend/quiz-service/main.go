package main

import (
	"log"
	"os"

	"github.com/bluewhales28/quiz-service/db"
	"github.com/bluewhales28/quiz-service/handlers"
	"github.com/gin-gonic/gin"
)

func main() {
	// Connect to Database
	db.ConnectDatabase()

	r := gin.Default()

	// Routes
	quizzes := r.Group("/quizzes")
	{
		quizzes.GET("", handlers.GetPublicQuizzes)
		quizzes.POST("", handlers.CreateQuiz)
		quizzes.GET("/:id", handlers.GetQuiz)
	}

	questions := r.Group("/questions")
	{
		questions.POST("", handlers.CreateQuestion)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8083"
	}

	log.Printf("Quiz Service running on port %s", port)
	r.Run(":" + port)
}
