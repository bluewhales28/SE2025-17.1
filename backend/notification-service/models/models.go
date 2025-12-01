package models

import (
	"encoding/json"
	"time"

	"gorm.io/datatypes"
)

// FlexibleTime wraps time.Time to handle multiple timestamp formats
type FlexibleTime struct {
	time.Time
}

// UnmarshalJSON implements custom JSON unmarshaling for FlexibleTime
func (ft *FlexibleTime) UnmarshalJSON(b []byte) error {
	// Try to unmarshal as number (Unix timestamp in milliseconds)
	var num int64
	if err := json.Unmarshal(b, &num); err == nil {
		ft.Time = time.Unix(0, num*int64(time.Millisecond))
		return nil
	}
	
	// Try to unmarshal as string
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}
	
	// Try multiple timestamp formats
	formats := []string{
		time.RFC3339,
		time.RFC3339Nano,
		"2006-01-02T15:04:05.999999999Z",
		"2006-01-02T15:04:05.999Z",
		"2006-01-02T15:04:05Z",
	}
	
	var parseErr error
	for _, format := range formats {
		t, err := time.Parse(format, s)
		if err == nil {
			ft.Time = t
			return nil
		}
		parseErr = err
	}
	
	return parseErr
}

// Notification đại diện cho một bản ghi thông báo trong cơ sở dữ liệu.
// Thông báo được gửi đến người dùng qua nhiều kênh (email, in-app, push).
type Notification struct {
	ID        uint            `json:"id" gorm:"primaryKey"`
	UserID    uint            `json:"user_id" gorm:"index"`
	Type      string          `json:"type" gorm:"index"` // VD: "quiz_assigned", "reset_password", "badge_earned"
	Title     string          `json:"title"`
	Content   string          `json:"content"`
	Channel   string          `json:"channel"` // email, in_app, push
	IsRead    bool            `json:"is_read"`
	Status    string          `json:"status"` // pending, sent, failed, archived
	CreatedAt time.Time       `json:"created_at" gorm:"index"`
	UpdatedAt time.Time       `json:"updated_at"`
	Metadata  datatypes.JSONMap `json:"metadata"` // Dữ liệu tùy chỉnh bổ sung
}

// TableName thiết lập tên bảng cho mô hình Notification.
func (Notification) TableName() string {
	return "notifications"
}

// Preference lưu trữ tùy chỉnh thông báo và cài đặt của người dùng.
// Người dùng có thể bật/tắt thông báo theo kênh và đặt tần suất.
type Preference struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"uniqueIndex:idx_user_channel"`
	Channel   string    `json:"channel" gorm:"uniqueIndex:idx_user_channel"` // email, push, in_app
	Enabled   bool      `json:"enabled"`
	Frequency string    `json:"frequency"` // immediate, daily, weekly, off (liền tức, hàng ngày, hàng tuần, tắt)
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName thiết lập tên bảng cho mô hình Preference.
func (Preference) TableName() string {
	return "preferences"
}

// Template lưu trữ các mẫu email/thông báo có thể được hiển thị động.
// Mẫu hỗ trợ cú pháp mẫu Go để nội suy biến.
type Template struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"uniqueIndex"` // VD: "quiz_assigned", "welcome"
	Subject   string    `json:"subject"`                 // Tiêu đề email (cho các mẫu email)
	BodyHTML  string    `json:"body_html" gorm:"type:text"`
	BodyText  string    `json:"body_text" gorm:"type:text"`
	Channel   string    `json:"channel"` // email, push, in_app
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName thiết lập tên bảng cho mô hình Template.
func (Template) TableName() string {
	return "templates"
}

// Event đại diện cho một sự kiện từ các dịch vụ khác kích hoạt thông báo.
// Sự kiện được xuất bản vào hàng đợi RabbitMQ bởi các microservice khác.
type Event struct {
	ID        string                 `json:"id"`
	EventType string                 `json:"event_type"`   // VD: "quiz_assigned"
	UserID    uint                   `json:"user_id"`
	Timestamp string                 `json:"timestamp"`    // ISO 8601 format timestamp
	Data      map[string]interface{} `json:"data"`         // Ngữ cảnh bổ sung để hiển thị mẫu
	Retry     int                    `json:"retry"`        // Số lần thử lại cho các sự kiện bị lỗi
}

// GetTime converts the ISO 8601 timestamp string to time.Time
func (e *Event) GetTime() (time.Time, error) {
	return time.Parse(time.RFC3339Nano, e.Timestamp)
}

// NotificationRequest là nội dung yêu cầu API để tạo thông báo.
type NotificationRequest struct {
	UserID    uint                   `json:"user_id" binding:"required"`
	Type      string                 `json:"type" binding:"required"`
	Title     string                 `json:"title" binding:"required"`
	Content   string                 `json:"content" binding:"required"`
	Channel   string                 `json:"channel" binding:"required"`
	Metadata  map[string]interface{} `json:"metadata"`
}

// PreferenceRequest là nội dung yêu cầu API để cập nhật tùy chỉnh thông báo.
type PreferenceRequest struct {
	Channel   string `json:"channel" binding:"required"`
	Enabled   bool   `json:"enabled"`
	Frequency string `json:"frequency"` // immediate, daily, weekly, off
}

// TemplateRequest là nội dung yêu cầu API để tạo mẫu email.
type TemplateRequest struct {
	Name      string `json:"name" binding:"required"`
	Subject   string `json:"subject" binding:"required"`
	BodyHTML  string `json:"body_html" binding:"required"`
	BodyText  string `json:"body_text" binding:"required"`
	Channel   string `json:"channel" binding:"required"`
}
