package worker

import (
	"fmt"
	"log"
	"sync"

	"github.com/bluewhales28/notification-service/models"
	"github.com/bluewhales28/notification-service/services"
	"gorm.io/gorm"
)

// WorkerPool quản lý xử lý đồng thời của các thông báo với khả năng xử lý có thể cấu hình.
// Nó phân phối các thông báo hàng loạt trên nhiều worker để xử lý song song.
type WorkerPool struct {
	numWorkers int
	jobQueue   chan *models.Notification
	wg         sync.WaitGroup
	db         *gorm.DB
	emailSvc   *services.EmailService
	stopChan   chan bool
}

// NewWorkerPool tạo một hồ bơi worker mới với số lượng worker đồng thời được chỉ định.
func NewWorkerPool(numWorkers int, db *gorm.DB, emailSvc *EmailService) *WorkerPool {
	return &WorkerPool{
		numWorkers: numWorkers,
		jobQueue:   make(chan *models.Notification, numWorkers*2), // Kênh được đệm
		db:         db,
		emailSvc:   emailSvc,
		stopChan:   make(chan bool),
	}
}

// Start khởi tạo và bắt đầu các goroutine của hồ bơi worker.
// Mỗi worker lắng nghe hàng đợi công việc và xử lý thông báo.
func (wp *WorkerPool) Start() {
	// Sinh ra các goroutine worker
	for i := 0; i < wp.numWorkers; i++ {
		wp.wg.Add(1)
		go wp.worker(i)
	}
	log.Printf("Worker pool started with %d workers", wp.numWorkers)
}

// worker là hàm công việc chính chạy bởi mỗi goroutine.
// Nó xử lý thông báo từ hàng đợi công việc cho đến khi dừng lại.
func (wp *WorkerPool) worker(id int) {
	defer wp.wg.Done()

	for {
		select {
		case <-wp.stopChan:
			log.Printf("Worker %d stopped", id)
			return
		case notification := <-wp.jobQueue:
			if notification == nil {
				continue
			}

			// Xử lý thông báo dựa trên kênh
			err := wp.processNotification(notification)
			if err != nil {
				log.Printf("Worker %d failed to process notification %d: %v", id, notification.ID, err)
				// Cập nhật trạng thái thông báo thất bại
				wp.db.Model(notification).Update("status", "failed")
			} else {
				// Cập nhật trạng thái thông báo đã gửi
				wp.db.Model(notification).Update("status", "sent")
			}
		}
	}
}

// SubmitJob thêm một thông báo vào hàng đợi hồ bơi worker để xử lý.
// Không chặn nếu hàng đợi không đầy, sẽ chặn nếu hàng đợi đạt đến công suất.
func (wp *WorkerPool) SubmitJob(notification *models.Notification) {
	wp.jobQueue <- notification
}

// SubmitBatch gửi nhiều thông báo tới hàng đợi hồ bơi worker.
func (wp *WorkerPool) SubmitBatch(notifications []*models.Notification) {
	for _, notif := range notifications {
		wp.SubmitJob(notif)
	}
}

// processNotification xử lý gửi thông báo dựa trên loại kênh.
// Hiện tại hỗ trợ: email, in_app (lưu trữ trong DB), push (placeholder).
func (wp *WorkerPool) processNotification(notification *models.Notification) error {
	switch notification.Channel {
	case "email":
		return wp.sendEmailNotification(notification)
	case "in_app":
		// Thông báo trong ứng dụng đã được lưu trữ trong DB, chỉ cần đánh dấu là đã xử lý
		return nil
	case "push":
		return wp.sendPushNotification(notification)
	default:
		return fmt.Errorf("unknown channel: %s", notification.Channel)
	}
}

// sendEmailNotification gửi thông báo email.
// Nó truy xuất email người nhận từ siêu dữ liệu và hiển thị mẫu.
func (wp *WorkerPool) sendEmailNotification(notification *models.Notification) error {
	// Trích xuất email người nhận từ siêu dữ liệu
	recipientEmail, ok := notification.Metadata["recipient_email"].(string)
	if !ok || recipientEmail == "" {
		return fmt.Errorf("recipient_email not found in metadata")
	}

	// Lấy mẫu từ cơ sở dữ liệu
	var template models.Template
	err := wp.db.Where("name = ?", notification.Type).First(&template).Error
	if err != nil {
		return fmt.Errorf("template not found: %w", err)
	}

	// Hiển thị mẫu với nội dung thông báo
	data := map[string]interface{}{
		"Title":      notification.Title,
		"Content":    notification.Content,
		"Metadata":   notification.Metadata,
	}

	// Hiển thị tiêu đề và nội dung
	subject, err := wp.emailSvc.RenderTemplate(template.Subject, data)
	if err != nil {
		return fmt.Errorf("failed to render subject: %w", err)
	}

	body, err := wp.emailSvc.RenderTemplate(template.BodyHTML, data)
	if err != nil {
		return fmt.Errorf("failed to render body: %w", err)
	}

	// Gửi email
	err = wp.emailSvc.SendEmail(recipientEmail, subject, "", body)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}

// sendPushNotification gửi thông báo đẩy.
// Đây là một triển khai placeholder có thể được tích hợp với FCM/Firebase.
func (wp *WorkerPool) sendPushNotification(notification *models.Notification) error {
	// TODO: Triển khai tích hợp FCM (Firebase Cloud Messaging)
	// Hiện tại, chỉ ghi nhật ký thông báo
	log.Printf("Push notification for user %d: %s", notification.UserID, notification.Title)
	return nil
}

// Stop tắt hồ bơi worker một cách nhuyễn mịn và chờ tất cả worker hoàn thành.
func (wp *WorkerPool) Stop() {
	// Tín hiệu tất cả worker dừng lại
	for i := 0; i < wp.numWorkers; i++ {
		wp.stopChan <- true
	}

	// Chờ tất cả worker hoàn thành
	wp.wg.Wait()

	// Đóng kênh
	close(wp.jobQueue)
	close(wp.stopChan)

	log.Println("Worker pool stopped")
}

// GetQueueSize trả về số lượng công việc hiện tại trong hàng đợi.
func (wp *WorkerPool) GetQueueSize() int {
	return len(wp.jobQueue)
}
