package worker

import (
	"testing"
	"time"

	"github.com/bluewhales28/notification-service/models"
	"github.com/bluewhales28/notification-service/services"
	"gorm.io/gorm"
)

// TestWorkerPoolCreation tests creating a new worker pool.
func TestWorkerPoolCreation(t *testing.T) {
	numWorkers := 5
	wp := NewWorkerPool(numWorkers, nil, nil)

	if wp.numWorkers != numWorkers {
		t.Errorf("Expected %d workers, got %d", numWorkers, wp.numWorkers)
	}

	if cap(wp.jobQueue) != numWorkers*2 {
		t.Errorf("Expected queue capacity %d, got %d", numWorkers*2, cap(wp.jobQueue))
	}
}

// TestWorkerPoolJobSubmission tests submitting jobs to worker pool.
func TestWorkerPoolJobSubmission(t *testing.T) {
	emailSvc := services.NewEmailService("smtp.gmail.com", "587", "user@gmail.com", "password")
	wp := NewWorkerPool(2, nil, emailSvc)

	// Submit a job
	notif := &models.Notification{
		ID:      1,
		UserID:  1,
		Type:    "test",
		Title:   "Test",
		Content: "Test content",
		Channel: "in_app",
	}

	wp.SubmitJob(notif)

	// Check queue size
	queueSize := wp.GetQueueSize()
	if queueSize != 1 {
		t.Errorf("Expected queue size 1, got %d", queueSize)
	}
}

// TestWorkerPoolBatchSubmission tests submitting multiple jobs.
func TestWorkerPoolBatchSubmission(t *testing.T) {
	emailSvc := services.NewEmailService("smtp.gmail.com", "587", "user@gmail.com", "password")
	wp := NewWorkerPool(2, nil, emailSvc)

	notifs := []*models.Notification{
		{ID: 1, UserID: 1, Channel: "in_app"},
		{ID: 2, UserID: 1, Channel: "in_app"},
		{ID: 3, UserID: 1, Channel: "in_app"},
	}

	wp.SubmitBatch(notifs)

	// Check queue size
	queueSize := wp.GetQueueSize()
	if queueSize != 3 {
		t.Errorf("Expected queue size 3, got %d", queueSize)
	}
}

// TestWorkerPoolProcessNotification tests notification processing.
// This is a unit test that doesn't require a real database.
func TestWorkerPoolProcessNotification(t *testing.T) {
	emailSvc := services.NewEmailService("smtp.gmail.com", "587", "user@gmail.com", "password")
	wp := NewWorkerPool(1, nil, emailSvc)

	// Test with in_app channel (no actual sending)
	notif := &models.Notification{
		ID:      1,
		UserID:  1,
		Type:    "test",
		Channel: "in_app",
	}

	err := wp.processNotification(notif)
	if err != nil {
		t.Errorf("Failed to process in_app notification: %v", err)
	}

	// Test with unknown channel
	notif.Channel = "unknown_channel"
	err = wp.processNotification(notif)
	if err == nil {
		t.Errorf("Expected error for unknown channel, got nil")
	}
}

// TestWorkerPoolLifecycle tests starting and stopping worker pool.
func TestWorkerPoolLifecycle(t *testing.T) {
	emailSvc := services.NewEmailService("smtp.gmail.com", "587", "user@gmail.com", "password")
	wp := NewWorkerPool(2, nil, emailSvc)

	// Start worker pool
	wp.Start()

	// Wait a bit for workers to start
	time.Sleep(100 * time.Millisecond)

	// Submit a job
	notif := &models.Notification{
		ID:      1,
		Channel: "in_app",
	}
	wp.SubmitJob(notif)

	// Wait for processing
	time.Sleep(100 * time.Millisecond)

	// Stop worker pool
	wp.Stop()

	// Verify channels are closed (non-blocking check)
	select {
	case <-wp.stopChan:
		// Channel should be closed, this is expected
	default:
		t.Errorf("Expected stopChan to be closed")
	}
}
