package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// Notification represents a notification record in the database.
// Notifications are sent to users via multiple channels (email, in-app, push).
type Notification struct {
	ID        uint            `json:"id" gorm:"primaryKey"`
	UserID    uint            `json:"user_id" gorm:"index"`
	Type      string          `json:"type" gorm:"index"` // e.g., "quiz_assigned", "reset_password", "badge_earned"
	Title     string          `json:"title"`
	Content   string          `json:"content"`
	Channel   string          `json:"channel"` // email, in_app, push
	IsRead    bool            `json:"is_read"`
	Status    string          `json:"status"` // pending, sent, failed, archived
	CreatedAt time.Time       `json:"created_at" gorm:"index"`
	UpdatedAt time.Time       `json:"updated_at"`
	Metadata  datatypes.JSONMap `json:"metadata"` // Additional custom data
}

// TableName sets the table name for Notification model.
func (Notification) TableName() string {
	return "notifications"
}

// Preference stores user notification preferences and settings.
// Users can enable/disable notifications per channel and set frequency.
type Preference struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"uniqueIndex:idx_user_channel"`
	Channel   string    `json:"channel" gorm:"uniqueIndex:idx_user_channel"` // email, push, in_app
	Enabled   bool      `json:"enabled"`
	Frequency string    `json:"frequency"` // immediate, daily, weekly, off
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName sets the table name for Preference model.
func (Preference) TableName() string {
	return "preferences"
}

// Template stores email/notification templates that can be dynamically rendered.
// Templates support Go template syntax for variable interpolation.
type Template struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"uniqueIndex"` // e.g., "quiz_assigned", "welcome"
	Subject   string    `json:"subject"`                 // Email subject (for email templates)
	BodyHTML  string    `json:"body_html" gorm:"type:text"`
	BodyText  string    `json:"body_text" gorm:"type:text"`
	Channel   string    `json:"channel"` // email, push, in_app
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName sets the table name for Template model.
func (Template) TableName() string {
	return "templates"
}

// Event represents an event from other services that triggers notifications.
// Events are published to RabbitMQ queue by other microservices.
type Event struct {
	ID        string                 `json:"id"`
	EventType string                 `json:"event_type"`   // e.g., "quiz_assigned"
	UserID    uint                   `json:"user_id"`
	Timestamp time.Time              `json:"timestamp"`
	Data      map[string]interface{} `json:"data"`         // Additional context for template rendering
	Retry     int                    `json:"retry"`        // Retry count for failed events
}

// NotificationRequest is the API request body for creating a notification.
type NotificationRequest struct {
	UserID    uint                   `json:"user_id" binding:"required"`
	Type      string                 `json:"type" binding:"required"`
	Title     string                 `json:"title" binding:"required"`
	Content   string                 `json:"content" binding:"required"`
	Channel   string                 `json:"channel" binding:"required"`
	Metadata  map[string]interface{} `json:"metadata"`
}

// PreferenceRequest is the API request body for updating notification preferences.
type PreferenceRequest struct {
	Channel   string `json:"channel" binding:"required"`
	Enabled   bool   `json:"enabled"`
	Frequency string `json:"frequency"` // immediate, daily, weekly, off
}

// TemplateRequest is the API request body for creating email templates.
type TemplateRequest struct {
	Name      string `json:"name" binding:"required"`
	Subject   string `json:"subject" binding:"required"`
	BodyHTML  string `json:"body_html" binding:"required"`
	BodyText  string `json:"body_text" binding:"required"`
	Channel   string `json:"channel" binding:"required"`
}
