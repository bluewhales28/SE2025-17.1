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
		quizzes.DELETE("/:id", handlers.DeleteQuiz)
	}

	questions := r.Group("/questions")
	{
		questions.GET("", handlers.GetQuestions)
		questions.POST("", handlers.CreateQuestion)
		questions.GET("/:id", handlers.GetQuestion)
		questions.PUT("/:id", handlers.UpdateQuestion)
		questions.DELETE("/:id", handlers.DeleteQuestion)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8083"
	}

	log.Printf("Quiz Service running on port %s", port)
	r.Run(":" + port)
}
