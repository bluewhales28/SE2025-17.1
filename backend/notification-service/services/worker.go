package worker

import (
	"fmt"
	"log"
	"sync"

	"github.com/bluewhales28/notification-service/models"
	"github.com/bluewhales28/notification-service/services"
	"gorm.io/gorm"
)

// WorkerPool manages concurrent processing of notifications with configurable concurrency.
// It distributes batch notifications across multiple workers for parallel sending.
type WorkerPool struct {
	numWorkers int
	jobQueue   chan *models.Notification
	wg         sync.WaitGroup
	db         *gorm.DB
	emailSvc   *services.EmailService
	stopChan   chan bool
}

// NewWorkerPool creates a new worker pool with the specified number of concurrent workers.
func NewWorkerPool(numWorkers int, db *gorm.DB, emailSvc *services.EmailService) *WorkerPool {
	return &WorkerPool{
		numWorkers: numWorkers,
		jobQueue:   make(chan *models.Notification, numWorkers*2), // Buffered channel
		db:         db,
		emailSvc:   emailSvc,
		stopChan:   make(chan bool),
	}
}

// Start initializes and starts the worker pool goroutines.
// Each worker listens to the job queue and processes notifications.
func (wp *WorkerPool) Start() {
	// Spawn worker goroutines
	for i := 0; i < wp.numWorkers; i++ {
		wp.wg.Add(1)
		go wp.worker(i)
	}
	log.Printf("Worker pool started with %d workers", wp.numWorkers)
}

// worker is the main work function run by each goroutine.
// It processes notifications from the job queue until stopped.
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

			// Process notification based on channel
			err := wp.processNotification(notification)
			if err != nil {
				log.Printf("Worker %d failed to process notification %d: %v", id, notification.ID, err)
				// Update notification status to failed
				wp.db.Model(notification).Update("status", "failed")
			} else {
				// Update notification status to sent
				wp.db.Model(notification).Update("status", "sent")
			}
		}
	}
}

// SubmitJob adds a notification to the worker pool queue for processing.
// Non-blocking if queue is not full, will block if queue reaches capacity.
func (wp *WorkerPool) SubmitJob(notification *models.Notification) {
	wp.jobQueue <- notification
}

// SubmitBatch submits multiple notifications to the worker pool queue.
func (wp *WorkerPool) SubmitBatch(notifications []*models.Notification) {
	for _, notif := range notifications {
		wp.SubmitJob(notif)
	}
}

// processNotification handles notification sending based on channel type.
// Currently supports: email, in_app (stored in DB), push (placeholder).
func (wp *WorkerPool) processNotification(notification *models.Notification) error {
	switch notification.Channel {
	case "email":
		return wp.sendEmailNotification(notification)
	case "in_app":
		// In-app notifications are already stored in DB, just mark as processed
		return nil
	case "push":
		return wp.sendPushNotification(notification)
	default:
		return fmt.Errorf("unknown channel: %s", notification.Channel)
	}
}

// sendEmailNotification sends an email notification.
// It retrieves the recipient email from metadata and renders the template.
func (wp *WorkerPool) sendEmailNotification(notification *models.Notification) error {
	// Extract recipient email from metadata
	recipientEmail, ok := notification.Metadata["recipient_email"].(string)
	if !ok || recipientEmail == "" {
		return fmt.Errorf("recipient_email not found in metadata")
	}

	// Get template from database
	var template models.Template
	err := wp.db.Where("name = ?", notification.Type).First(&template).Error
	if err != nil {
		return fmt.Errorf("template not found: %w", err)
	}

	// Render template with notification content
	data := map[string]interface{}{
		"Title":      notification.Title,
		"Content":    notification.Content,
		"Metadata":   notification.Metadata,
	}

	// Render subject and body
	subject, err := wp.emailSvc.RenderTemplate(template.Subject, data)
	if err != nil {
		return fmt.Errorf("failed to render subject: %w", err)
	}

	body, err := wp.emailSvc.RenderTemplate(template.BodyHTML, data)
	if err != nil {
		return fmt.Errorf("failed to render body: %w", err)
	}

	// Send email
	err = wp.emailSvc.SendEmail(recipientEmail, subject, "", body)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}

// sendPushNotification sends a push notification.
// This is a placeholder implementation that can be integrated with FCM/Firebase.
func (wp *WorkerPool) sendPushNotification(notification *models.Notification) error {
	// TODO: Implement FCM (Firebase Cloud Messaging) integration
	// For now, just log the notification
	log.Printf("Push notification for user %d: %s", notification.UserID, notification.Title)
	return nil
}

// Stop gracefully shuts down the worker pool and waits for all workers to finish.
func (wp *WorkerPool) Stop() {
	// Signal all workers to stop
	for i := 0; i < wp.numWorkers; i++ {
		wp.stopChan <- true
	}

	// Wait for all workers to finish
	wp.wg.Wait()

	// Close channels
	close(wp.jobQueue)
	close(wp.stopChan)

	log.Println("Worker pool stopped")
}

// GetQueueSize returns the current number of jobs in the queue.
func (wp *WorkerPool) GetQueueSize() int {
	return len(wp.jobQueue)
}
