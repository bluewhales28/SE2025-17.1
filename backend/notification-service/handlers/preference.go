package handlers

import (
	"net/http"

	"github.com/bluewhales28/notification-service/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// PreferenceHandler manages HTTP endpoints for notification preferences.
type PreferenceHandler struct {
	db *gorm.DB
}

// NewPreferenceHandler creates a new preference handler.
func NewPreferenceHandler(db *gorm.DB) *PreferenceHandler {
	return &PreferenceHandler{db: db}
}

// UpdatePreference handles PUT /preferences/:user_id to update user notification preferences.
// Allows users to enable/disable notifications per channel and set frequency.
func (h *PreferenceHandler) UpdatePreference(c *gin.Context) {
	userID := c.Param("user_id")
	var req models.PreferenceRequest

	// Parse and validate request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Try to find existing preference
	var preference models.Preference
	result := h.db.Where("user_id = ? AND channel = ?", userID, req.Channel).First(&preference)

	if result.Error == gorm.ErrRecordNotFound {
		// Create new preference if doesn't exist
		preference = models.Preference{
			UserID:    parseUserID(userID),
			Channel:   req.Channel,
			Enabled:   req.Enabled,
			Frequency: req.Frequency,
		}
		if err := h.db.Create(&preference).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create preference"})
			return
		}
	} else if result.Error != nil {
		// Database error
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	} else {
		// Update existing preference
		if err := h.db.Model(&preference).Updates(req).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update preference"})
			return
		}
	}

	c.JSON(http.StatusOK, preference)
}

// GetPreferences handles GET /preferences/:user_id to fetch user's notification preferences.
// Returns all channel preferences for the user.
func (h *PreferenceHandler) GetPreferences(c *gin.Context) {
	userID := c.Param("user_id")

	var preferences []models.Preference
	if err := h.db.Where("user_id = ?", userID).Find(&preferences).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch preferences"})
		return
	}

	c.JSON(http.StatusOK, preferences)
}

// GetPreference handles GET /preferences/:user_id/:channel to fetch specific channel preference.
func (h *PreferenceHandler) GetPreference(c *gin.Context) {
	userID := c.Param("user_id")
	channel := c.Param("channel")

	var preference models.Preference
	if err := h.db.Where("user_id = ? AND channel = ?", userID, channel).
		First(&preference).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Preference not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, preference)
}

// DeletePreference handles DELETE /preferences/:user_id/:channel to delete a preference.
func (h *PreferenceHandler) DeletePreference(c *gin.Context) {
	userID := c.Param("user_id")
	channel := c.Param("channel")

	if err := h.db.Where("user_id = ? AND channel = ?", userID, channel).
		Delete(&models.Preference{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete preference"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Preference deleted"})
}

// parseUserID converts user_id string to uint.
// Returns 0 if parsing fails.
func parseUserID(userIDStr string) uint {
	var userID uint64
	if _, err := (&userID); err != nil {
		return 0
	}
	return uint(userID)
}
