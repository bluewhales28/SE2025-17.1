package handlers

import (
	"net/http"
	"strconv"

	"github.com/bluewhales28/notification-service/models"
	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// NotificationHandler quản lý các điểm cuối HTTP cho các hoạt động thông báo.
type NotificationHandler struct {
	db *gorm.DB
}

// NewNotificationHandler tạo một bộ xử lý thông báo mới.
func NewNotificationHandler(db *gorm.DB) *NotificationHandler {
	return &NotificationHandler{db: db}
}

// CreateNotification xử lý POST /notifications để tạo thông báo mới.
// Nội dung yêu cầu sẽ chứa NotificationRequest với user_id, type, title, content, channel.
func (h *NotificationHandler) CreateNotification(c *gin.Context) {
	var req models.NotificationRequest

	// Phân tích cú pháp và xác thực yêu cầu
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Tạo bản ghi thông báo
	notification := models.Notification{
		UserID:   req.UserID,
		Type:     req.Type,
		Title:    req.Title,
		Content:  req.Content,
		Channel:  req.Channel,
		IsRead:   false,
		Status:   "pending",
		Metadata: datatypes.JSONMap(req.Metadata),
	}

	// Lưu vào cơ sở dữ liệu
	if err := h.db.Create(&notification).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create notification"})
		return
	}

	c.JSON(http.StatusCreated, notification)
}

// GetNotifications xử lý GET /notifications/:user_id để tìm nạp thông báo của người dùng.
// Hỗ trợ phân trang với các tham số truy vấn: page, limit
func (h *NotificationHandler) GetNotifications(c *gin.Context) {
	userID := c.Param("user_id")
	page := c.DefaultQuery("page", "1")
	limit := c.DefaultQuery("limit", "10")

	pageNum, _ := strconv.Atoi(page)
	limitNum, _ := strconv.Atoi(limit)

	// Tính toán offset cho phân trang
	offset := (pageNum - 1) * limitNum

	var notifications []models.Notification
	// Tìm nạp thông báo với phân trang, sắp xếp theo mới nhất trước
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

// GetNotification xử lý GET /notifications/:id để tìm nạp một thông báo.
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

// MarkAsRead xử lý PUT /notifications/:id/read để đánh dấu thông báo là đã đọc.
func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
	id := c.Param("id")

	// Cập nhật cờ is_read
	if err := h.db.Model(&models.Notification{}).Where("id = ?", id).Update("is_read", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification marked as read"})
}

// MarkAsArchived xử lý PUT /notifications/:id/archive để đánh dấu thông báo là được lưu trữ.
func (h *NotificationHandler) MarkAsArchived(c *gin.Context) {
	id := c.Param("id")

	// Cập nhật trạng thái để lưu trữ
	if err := h.db.Model(&models.Notification{}).Where("id = ?", id).Update("status", "archived").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to archive notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification archived"})
}

// DeleteNotification xử lý DELETE /notifications/:id để xóa thông báo.
func (h *NotificationHandler) DeleteNotification(c *gin.Context) {
	id := c.Param("id")

	if err := h.db.Delete(&models.Notification{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification deleted"})
}

// GetUnreadCount xử lý GET /notifications/:user_id/unread/count để lấy số thông báo chưa đọc.
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
