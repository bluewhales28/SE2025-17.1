package handlers

import (
	"net/http"
	"strconv"

	"github.com/bluewhales28/notification-service/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// NotificationHandler manages HTTP endpoints for notification operations.
type NotificationHandler struct {
	db *gorm.DB
}

// NewNotificationHandler creates a new notification handler.
func NewNotificationHandler(db *gorm.DB) *NotificationHandler {
	return &NotificationHandler{db: db}
}

// CreateNotification handles POST /notifications to create a new notification.
// Request body should contain NotificationRequest with user_id, type, title, content, channel.
func (h *NotificationHandler) CreateNotification(c *gin.Context) {
	var req models.NotificationRequest

	// Parse and validate request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create notification record
	notification := models.Notification{
		UserID:   req.UserID,
		Type:     req.Type,
		Title:    req.Title,
		Content:  req.Content,
		Channel:  req.Channel,
		IsRead:   false,
		Status:   "pending",
		Metadata: models.datatypes.JSONMap(req.Metadata),
	}

	// Save to database
	if err := h.db.Create(&notification).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create notification"})
		return
	}

	c.JSON(http.StatusCreated, notification)
}

// GetNotifications handles GET /notifications/:user_id to fetch user's notifications.
// Supports pagination with query parameters: page, limit
func (h *NotificationHandler) GetNotifications(c *gin.Context) {
	userID := c.Param("user_id")
	page := c.DefaultQuery("page", "1")
	limit := c.DefaultQuery("limit", "10")

	pageNum, _ := strconv.Atoi(page)
	limitNum, _ := strconv.Atoi(limit)

	// Calculate offset for pagination
	offset := (pageNum - 1) * limitNum

	var notifications []models.Notification
	// Fetch notifications with pagination, ordered by newest first
	if err := h.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Offset(offset).
		Limit(limitNum).
		Find(&notifications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notifications"})
		return
	}

	c.JSON(http.StatusOK, notifications)
}

// GetNotification handles GET /notifications/:id to fetch a single notification.
func (h *NotificationHandler) GetNotification(c *gin.Context) {
	id := c.Param("id")

	var notification models.Notification
	if err := h.db.First(&notification, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, notification)
}

// MarkAsRead handles PUT /notifications/:id/read to mark a notification as read.
func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
	id := c.Param("id")

	// Update is_read flag
	if err := h.db.Model(&models.Notification{}).Where("id = ?", id).Update("is_read", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification marked as read"})
}

// MarkAsArchived handles PUT /notifications/:id/archive to mark a notification as archived.
func (h *NotificationHandler) MarkAsArchived(c *gin.Context) {
	id := c.Param("id")

	// Update status to archived
	if err := h.db.Model(&models.Notification{}).Where("id = ?", id).Update("status", "archived").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to archive notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification archived"})
}

// DeleteNotification handles DELETE /notifications/:id to delete a notification.
func (h *NotificationHandler) DeleteNotification(c *gin.Context) {
	id := c.Param("id")

	if err := h.db.Delete(&models.Notification{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification deleted"})
}

// GetUnreadCount handles GET /notifications/:user_id/unread/count to get count of unread notifications.
func (h *NotificationHandler) GetUnreadCount(c *gin.Context) {
	userID := c.Param("user_id")

	var count int64
	if err := h.db.Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count unread"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"unread_count": count})
}
