package main

import (
	"log"

	"github.com/bluewhales28/notification-service/config"
	"github.com/bluewhales28/notification-service/handlers"
	"github.com/bluewhales28/notification-service/models"
	"github.com/bluewhales28/notification-service/services"
	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// main khởi tạo dịch vụ thông báo với cơ sở dữ liệu, consumer RabbitMQ, hồ bơi worker và bộ định tuyến Gin.
// Nó bắt đầu máy chủ HTTP và trình nghe hàng đợi nền trong các goroutine riêng biệt.
func main() {
	// Tải cấu hình từ môi trường
	cfg := config.LoadConfig()

	// Kết nối tới cơ sở dữ liệu
	db, err := config.ConnectDB(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Chạy các di chuyển cơ sở dữ liệu để tạo bảng
	err = migrateDatabase(db)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Khởi tạo các dịch vụ
	emailSvc := services.NewEmailService(cfg.SMTPHost, cfg.SMTPPort, cfg.SMTPUser, cfg.SMTPPassword, cfg.TemplateDir)

	// Khởi tạo hồ bơi worker với 10 worker đồng thời
	wp := services.NewWorkerPool(10, db, emailSvc)
	wp.Start()
	defer wp.Stop()

	// Thiết lập bộ định tuyến Gin
	router := setupRouter(db)

	// Bắt đầu consumer RabbitMQ trong một goroutine riêng biệt
	go func() {
		consumer, err := services.NewConsumer(cfg.RabbitMQURL, "notification_events", db)
		if err != nil {
			log.Printf("Failed to create consumer: %v", err)
			return
		}
		defer consumer.Close()

		// Xử lý sự kiện từ hàng đợi
		consumer.Listen(func(event *models.Event) error {
			// Tạo thông báo từ sự kiện
			notification := models.Notification{
				UserID:   event.UserID,
				Type:     event.EventType,
				Title:    "Event: " + event.EventType,
				Content:  "New event received",
				Channel:  "email",
				Status:   "pending",
				Metadata: datatypes.JSONMap(event.Data),
			}

			// Lưu thông báo vào cơ sở dữ liệu
			if err := db.Create(&notification).Error; err != nil {
				return err
			}

			// Gửi thông báo đến hồ bơi worker để xử lý
			wp.SubmitJob(&notification)
			return nil
		})
	}()

	// Khởi động máy chủ HTTP
	log.Printf("Starting notification service on port %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// migrateDatabase chạy tất cả các di chuyển cơ sở dữ liệu để tạo/cập nhật bảng.
func migrateDatabase(db *gorm.DB) error {
	// AutoMigrate tạo bảng nếu chúng không tồn tại và thêm các cột bị thiếu
	return db.AutoMigrate(
		&models.Notification{},
		&models.Preference{},
		&models.Template{},
	)
}

// setupRouter định cấu hình tất cả các tuyến Gin và trình xử lý.
func setupRouter(db *gorm.DB) *gin.Engine {
	router := gin.Default()

	// Initialize handlers
	notifHandler := handlers.NewNotificationHandler(db)
	prefHandler := handlers.NewPreferenceHandler(db)
	tmplHandler := handlers.NewTemplateHandler(db)

	// Kiểm tra tình trạng sức khỏe
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Tuyến thông báo
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

	// Tuyến tùy chọn
	preferences := router.Group("/preferences")
	{
		preferences.PUT("/:user_id", prefHandler.UpdatePreference)
		preferences.GET("/:user_id", prefHandler.GetPreferences)
		preferences.GET("/:user_id/:channel", prefHandler.GetPreference)
		preferences.DELETE("/:user_id/:channel", prefHandler.DeletePreference)
	}

	// Tuyến mẫu
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
