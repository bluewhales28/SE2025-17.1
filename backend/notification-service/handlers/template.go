package handlers

import (
	"net/http"

	"github.com/bluewhales28/notification-service/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// TemplateHandler manages HTTP endpoints for email templates.
type TemplateHandler struct {
	db *gorm.DB
}

// NewTemplateHandler creates a new template handler.
func NewTemplateHandler(db *gorm.DB) *TemplateHandler {
	return &TemplateHandler{db: db}
}

// CreateTemplate handles POST /templates to create a new email template.
// Templates use Go template syntax and can be rendered with custom data.
func (h *TemplateHandler) CreateTemplate(c *gin.Context) {
	var req models.TemplateRequest

	// Parse and validate request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create template record
	template := models.Template{
		Name:      req.Name,
		Subject:   req.Subject,
		BodyHTML:  req.BodyHTML,
		BodyText:  req.BodyText,
		Channel:   req.Channel,
	}

	// Save to database
	if err := h.db.Create(&template).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create template"})
		return
	}

	c.JSON(http.StatusCreated, template)
}

// GetTemplates handles GET /templates to fetch all templates.
// Supports filtering by channel with query parameter: channel
func (h *TemplateHandler) GetTemplates(c *gin.Context) {
	channel := c.Query("channel")

	var templates []models.Template
	query := h.db

	// Filter by channel if provided
	if channel != "" {
		query = query.Where("channel = ?", channel)
	}

	if err := query.Find(&templates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch templates"})
		return
	}

	c.JSON(http.StatusOK, templates)
}

// GetTemplate handles GET /templates/:id to fetch a single template.
func (h *TemplateHandler) GetTemplate(c *gin.Context) {
	id := c.Param("id")

	var template models.Template
	if err := h.db.First(&template, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Template not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, template)
}

// GetTemplateByName handles GET /templates/name/:name to fetch template by name.
// This is useful when you know the event type name.
func (h *TemplateHandler) GetTemplateByName(c *gin.Context) {
	name := c.Param("name")

	var template models.Template
	if err := h.db.Where("name = ?", name).First(&template).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Template not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, template)
}

// UpdateTemplate handles PUT /templates/:id to update an existing template.
func (h *TemplateHandler) UpdateTemplate(c *gin.Context) {
	id := c.Param("id")
	var req models.TemplateRequest

	// Parse and validate request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find existing template
	var template models.Template
	if err := h.db.First(&template, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Template not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Update template
	if err := h.db.Model(&template).Updates(req).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update template"})
		return
	}

	c.JSON(http.StatusOK, template)
}

// DeleteTemplate handles DELETE /templates/:id to delete a template.
func (h *TemplateHandler) DeleteTemplate(c *gin.Context) {
	id := c.Param("id")

	if err := h.db.Delete(&models.Template{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete template"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Template deleted"})
}
