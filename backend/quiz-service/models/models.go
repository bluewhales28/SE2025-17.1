package models

import (
	"time"

	"github.com/lib/pq"
)

type Difficulty string
type QuestionType string
type AttemptStatus string

const (
	DifficultyEasy   Difficulty = "EASY"
	DifficultyMedium Difficulty = "MEDIUM"
	DifficultyHard   Difficulty = "HARD"

	TypeMultipleChoice QuestionType = "MULTIPLE_CHOICE"
	TypeTrueFalse      QuestionType = "TRUE_FALSE"
	TypeEssay          QuestionType = "ESSAY"

	StatusStarted    AttemptStatus = "STARTED"
	StatusInProgress AttemptStatus = "IN_PROGRESS"
	StatusCompleted  AttemptStatus = "COMPLETED"
)

type Quiz struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Title       string         `gorm:"not null" json:"title"`
	Description string         `json:"description"`
	TimeLimit   int            `json:"timeLimit"` // in minutes
	TotalPoints int            `json:"totalPoints"`
	MaxAttempts int            `json:"maxAttempts"`
	IsPublic    bool           `json:"isPublic"`
	Tags        pq.StringArray `gorm:"type:text[]" json:"tags"`
	Topic       string         `json:"topic"`
	Difficulty  Difficulty     `json:"difficulty"`
	CreatorID   uint           `gorm:"not null" json:"creatorId"`
	Questions   []Question     `gorm:"foreignKey:QuizID" json:"questions,omitempty"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
}

type Question struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	Content    string         `gorm:"not null" json:"content"`
	Type       QuestionType   `json:"type"`
	Difficulty Difficulty     `json:"difficulty"`
	Points     int            `json:"points"`
	Tags       pq.StringArray `gorm:"type:text[]" json:"tags"`
	QuizID     uint           `json:"quizId"`
	Answers    []Answer       `gorm:"foreignKey:QuestionID" json:"answers,omitempty"`
}

type Answer struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	Content    string `gorm:"not null" json:"content"`
	IsCorrect  bool   `json:"isCorrect"`
	QuestionID uint   `json:"questionId"`
}

type QuizAttempt struct {
	ID        uint          `gorm:"primaryKey" json:"id"`
	UserID    uint          `gorm:"not null" json:"userId"`
	QuizID    uint          `gorm:"not null" json:"quizId"`
	Quiz      Quiz          `json:"quiz"`
	StartTime time.Time     `json:"startTime"`
	EndTime   *time.Time    `json:"endTime"`
	Score     float64       `json:"score"`
	Status    AttemptStatus `json:"status"`
}
