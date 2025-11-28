package handlers

import (
	"net/http"

	"github.com/bluewhales28/quiz-service/db"
	"github.com/bluewhales28/quiz-service/models"
	"github.com/gin-gonic/gin"
)

// Get all public quizzes
func GetPublicQuizzes(c *gin.Context) {
	var quizzes []models.Quiz
	if err := db.DB.Where("is_public = ?", true).Find(&quizzes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, quizzes)
}

// Create a new quiz
func CreateQuiz(c *gin.Context) {
	var quiz models.Quiz
	if err := c.ShouldBindJSON(&quiz); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := db.DB.Create(&quiz).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, quiz)
}

// Get quiz by ID
func GetQuiz(c *gin.Context) {
	id := c.Param("id")
	var quiz models.Quiz
	if err := db.DB.Preload("Questions.Answers").First(&quiz, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Quiz not found"})
		return
	}
	c.JSON(http.StatusOK, quiz)
}

// Create a question for a quiz
func CreateQuestion(c *gin.Context) {
	var question models.Question
	if err := c.ShouldBindJSON(&question); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify quiz exists
	var quiz models.Quiz
	if err := db.DB.First(&quiz, question.QuizID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Quiz not found"})
		return
	}

	if err := db.DB.Create(&question).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, question)
}
