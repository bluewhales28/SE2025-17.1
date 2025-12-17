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

// Get all questions
func GetQuestions(c *gin.Context) {
	var questions []models.Question
	if err := db.DB.Preload("Answers").Find(&questions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, questions)
}

// Get question by ID
func GetQuestion(c *gin.Context) {
	id := c.Param("id")
	var question models.Question
	if err := db.DB.Preload("Answers").First(&question, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Question not found"})
		return
	}
	c.JSON(http.StatusOK, question)
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

// Update a question
func UpdateQuestion(c *gin.Context) {
	id := c.Param("id")
	var question models.Question
	
	if err := db.DB.First(&question, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Question not found"})
		return
	}

	var updateData models.Question
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update question fields
	if updateData.Content != "" {
		question.Content = updateData.Content
	}
	if updateData.Type != "" {
		question.Type = updateData.Type
	}
	if updateData.Difficulty != "" {
		question.Difficulty = updateData.Difficulty
	}
	if updateData.Points > 0 {
		question.Points = updateData.Points
	}
	if len(updateData.Tags) > 0 {
		question.Tags = updateData.Tags
	}
	if updateData.QuizID > 0 {
		question.QuizID = updateData.QuizID
	}

	// Update answers if provided
	if len(updateData.Answers) > 0 {
		// Delete existing answers
		db.DB.Where("question_id = ?", question.ID).Delete(&models.Answer{})
		// Create new answers
		for i := range updateData.Answers {
			updateData.Answers[i].QuestionID = question.ID
		}
		question.Answers = updateData.Answers
	}

	if err := db.DB.Save(&question).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, question)
}

// Delete a question
func DeleteQuestion(c *gin.Context) {
	id := c.Param("id")
	var question models.Question
	
	if err := db.DB.First(&question, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Question not found"})
		return
	}

	// Delete associated answers first
	db.DB.Where("question_id = ?", question.ID).Delete(&models.Answer{})
	
	// Delete question
	if err := db.DB.Delete(&question).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Question deleted successfully"})
}
