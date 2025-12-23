package main

import (
	"fmt"
	"log"
	"time"
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
	router := setupRouter(db, wp)

	// Bắt đầu consumer RabbitMQ trong một goroutine riêng biệt
	go func() {
		// Retry logic để đợi RabbitMQ sẵn sàng
		var consumer *services.Consumer
		var err error
		maxRetries := 10
		retryDelay := 5 // seconds
		
		for i := 0; i < maxRetries; i++ {
			consumer, err = services.NewConsumer(cfg.RabbitMQURL, "notification_events", db)
			if err == nil {
				log.Printf("✅ Successfully connected to RabbitMQ")
				break
			}
			log.Printf("⚠️  Failed to connect to RabbitMQ (attempt %d/%d): %v, retrying in %d seconds...", i+1, maxRetries, err, retryDelay)
			time.Sleep(time.Duration(retryDelay) * time.Second)
		}
		
		if err != nil {
			log.Printf("❌ Failed to create consumer after %d attempts: %v", maxRetries, err)
			return
		}
		defer consumer.Close()

		// Xử lý sự kiện từ hàng đợi
		log.Printf("📨 Starting to listen for RabbitMQ events...")
		consumer.Listen(func(event *models.Event) error {
			log.Printf("📬 Received event: type=%s, user_id=%d", event.EventType, event.UserID)
			
			// Lấy thông tin từ data map (EmailEvent từ Java gửi các field vào data)
			recipientEmail, _ := event.Data["recipient_email"].(string)
			subject, _ := event.Data["subject"].(string)
			userName, _ := event.Data["user_name"].(string)
			
			// Tạo title và content từ event
			title := subject
			if title == "" {
				title = "Event: " + event.EventType
			}
			
			content := "New event received"
			if userName != "" {
				content = fmt.Sprintf("Hello %s, you have a new notification", userName)
			}
			
			// Tạo thông báo từ sự kiện
			notification := models.Notification{
				UserID:   event.UserID,
				Type:     event.EventType, // VD: "user_registered", "password_reset"
				Title:    title,
				Content:  content,
				Channel:  "email",
				Status:   "pending",
				Metadata: datatypes.JSONMap(event.Data), // Giữ nguyên data để worker có thể dùng
			}

			// Lưu thông báo vào cơ sở dữ liệu
			if err := db.Create(&notification).Error; err != nil {
				log.Printf("❌ Failed to create notification: %v", err)
				return err
			}
			
			log.Printf("✅ Notification created: ID=%d, type=%s, email=%s", notification.ID, notification.Type, recipientEmail)

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
	// Nếu gặp lỗi, cứ tiếp tục - bảng có thể đã tồn tại
	if err := db.AutoMigrate(&models.Notification{}); err != nil {
		log.Printf("Warning: Failed to migrate Notification: %v", err)
	}
	if err := db.AutoMigrate(&models.Preference{}); err != nil {
		log.Printf("Warning: Failed to migrate Preference: %v", err)
	}
	if err := db.AutoMigrate(&models.Template{}); err != nil {
		log.Printf("Warning: Failed to migrate Template: %v", err)
	}
	return nil
}

// setupRouter định cấu hình tất cả các tuyến Gin và trình xử lý.
func setupRouter(db *gorm.DB, wp *services.WorkerPool) *gin.Engine {
	router := gin.Default()

	// Initialize handlers
	notifHandler := handlers.NewNotificationHandler(db, wp)
	prefHandler := handlers.NewPreferenceHandler(db)
	tmplHandler := handlers.NewTemplateHandler(db)

	// Kiểm tra tình trạng sức khỏe (hỗ trợ cả GET và HEAD cho healthcheck)
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
	router.HEAD("/health", func(c *gin.Context) {
		c.Status(200)
	})

	// Tuyến thông báo
	// QUAN TRỌNG: Tách thành các route group khác nhau để tránh xung đột parameter
	router.POST("/notifications", notifHandler.CreateNotification)
	router.GET("/notifications/user/:user_id/unread/count", notifHandler.GetUnreadCount)
	router.GET("/notifications/user/:user_id", notifHandler.GetNotifications)
	router.GET("/notifications/:id", notifHandler.GetNotification)
	router.PUT("/notifications/:id/read", notifHandler.MarkAsRead)
	router.PUT("/notifications/:id/archive", notifHandler.MarkAsArchived)
	router.DELETE("/notifications/:id", notifHandler.DeleteNotification)

	// Tuyến tùy chọn
	preferences := router.Group("/preferences")
	{
		preferences.GET("/:user_id/:channel", prefHandler.GetPreference)
		preferences.DELETE("/:user_id/:channel", prefHandler.DeletePreference)
		preferences.PUT("/:user_id", prefHandler.UpdatePreference)
		preferences.GET("/:user_id", prefHandler.GetPreferences)
	}

	// Tuyến mẫu
	templates := router.Group("/templates")
	{
		templates.GET("/name/:name", tmplHandler.GetTemplateByName)
		templates.GET("", tmplHandler.GetTemplates)
		templates.POST("", tmplHandler.CreateTemplate)
		templates.GET("/:id", tmplHandler.GetTemplate)
		templates.PUT("/:id", tmplHandler.UpdateTemplate)
		templates.DELETE("/:id", tmplHandler.DeleteTemplate)
	}

	return router
}
