package main

import (
	"log"

	"github.com/bluewhales28/notification-service/config"
	"github.com/bluewhales28/notification-service/handlers"
	"github.com/bluewhales28/notification-service/models"
	"github.com/bluewhales28/notification-service/services"
	"github.com/bluewhales28/notification-service/services/queue"
	"github.com/bluewhales28/notification-service/services/worker"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// main initializes the notification service with database, RabbitMQ consumer, worker pool, and Gin router.
// It starts the HTTP server and background queue listener in separate goroutines.
func main() {
	// Load configuration from environment
	cfg := config.LoadConfig()

	// Connect to database
	db, err := config.ConnectDB(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Run database migrations to create tables
	err = migrateDatabase(db)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Initialize services
	emailSvc := services.NewEmailService(cfg.SMTPHost, cfg.SMTPPort, cfg.SMTPUser, cfg.SMTPPassword)

	// Initialize worker pool with 10 concurrent workers
	wp := worker.NewWorkerPool(10, db, emailSvc)
	wp.Start()
	defer wp.Stop()

	// Setup Gin router
	router := setupRouter(db)

	// Start RabbitMQ consumer in a separate goroutine
	go func() {
		consumer, err := queue.NewConsumer(cfg.RabbitMQURL, "notification_events", db)
		if err != nil {
			log.Printf("Failed to create consumer: %v", err)
			return
		}
		defer consumer.Close()

		// Process events from queue
		consumer.Listen(func(event *models.Event) error {
			// Create notification from event
			notification := models.Notification{
				UserID:   event.UserID,
				Type:     event.EventType,
				Title:    "Event: " + event.EventType,
				Content:  "New event received",
				Channel:  "email",
				Status:   "pending",
				Metadata: models.datatypes.JSONMap(event.Data),
			}

			// Save notification to database
			if err := db.Create(&notification).Error; err != nil {
				return err
			}

			// Submit notification to worker pool for processing
			wp.SubmitJob(&notification)
			return nil
		})
	}()

	// Start HTTP server
	log.Printf("Starting notification service on port %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// migrateDatabase runs all database migrations to create/update tables.
func migrateDatabase(db *gorm.DB) error {
	// AutoMigrate creates tables if they don't exist and adds missing columns
	return db.AutoMigrate(
		&models.Notification{},
		&models.Preference{},
		&models.Template{},
	)
}

// setupRouter configures all Gin routes and handlers.
func setupRouter(db *gorm.DB) *gin.Engine {
	router := gin.Default()

	// Initialize handlers
	notifHandler := handlers.NewNotificationHandler(db)
	prefHandler := handlers.NewPreferenceHandler(db)
	tmplHandler := handlers.NewTemplateHandler(db)

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Notification routes
	notifications := router.Group("/notifications")
	{
		notifications.POST("", notifHandler.CreateNotification)
		notifications.GET("/:user_id", notifHandler.GetNotifications)
		notifications.GET("/:id", notifHandler.GetNotification)
		notifications.PUT("/:id/read", notifHandler.MarkAsRead)
		notifications.PUT("/:id/archive", notifHandler.MarkAsArchived)
		notifications.DELETE("/:id", notifHandler.DeleteNotification)
		notifications.GET("/:user_id/unread/count", notifHandler.GetUnreadCount)
	}

	// Preference routes
	preferences := router.Group("/preferences")
	{
		preferences.PUT("/:user_id", prefHandler.UpdatePreference)
		preferences.GET("/:user_id", prefHandler.GetPreferences)
		preferences.GET("/:user_id/:channel", prefHandler.GetPreference)
		preferences.DELETE("/:user_id/:channel", prefHandler.DeletePreference)
	}

	// Template routes
	templates := router.Group("/templates")
	{
		templates.POST("", tmplHandler.CreateTemplate)
		templates.GET("", tmplHandler.GetTemplates)
		templates.GET("/:id", tmplHandler.GetTemplate)
		templates.GET("/name/:name", tmplHandler.GetTemplateByName)
		templates.PUT("/:id", tmplHandler.UpdateTemplate)
		templates.DELETE("/:id", tmplHandler.DeleteTemplate)
	}

	return router
}
