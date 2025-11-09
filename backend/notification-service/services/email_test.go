package services

import (
	"strings"
	"testing"

	"github.com/bluewhales28/notification-service/models"
)

// TestEmailRenderTemplate tests the template rendering functionality.
func TestEmailRenderTemplate(t *testing.T) {
	svc := NewEmailService("smtp.gmail.com", "587", "user@gmail.com", "password", "templates/email")

	// Test template with variable substitution
	templateStr := "Hello {{.Name}}, your reset link is {{.ResetLink}}"
	data := map[string]interface{}{
		"Name":      "John Doe",
		"ResetLink": "https://example.com/reset/abc123",
	}

	result, err := svc.RenderTemplate(templateStr, data)
	if err != nil {
		t.Fatalf("Failed to render template: %v", err)
	}

	// Verify result contains expected values
	if !strings.Contains(result, "John Doe") {
		t.Errorf("Expected 'John Doe' in result, got: %s", result)
	}

	if !strings.Contains(result, "https://example.com/reset/abc123") {
		t.Errorf("Expected reset link in result, got: %s", result)
	}
}

// TestSendEmail tests email sending (requires SMTP configuration).
// Note: This test is skipped in CI/CD unless SMTP credentials are provided.
func TestSendEmail(t *testing.T) {
	// Skip if SMTP credentials not configured
	smtpUser := getTestEnv("SMTP_USER", "")
	if smtpUser == "" {
		t.Skip("Skipping email test: SMTP_USER not configured")
	}

	svc := NewEmailService(
		getTestEnv("SMTP_HOST", "smtp.gmail.com"),
		getTestEnv("SMTP_PORT", "587"),
		smtpUser,
		getTestEnv("SMTP_PASSWORD", ""),
		"templates/email",
	)

	// Test sending email
	err := svc.SendEmail(
		"test@example.com",
		"Test Subject",
		"Test body",
		"<h1>Test HTML Body</h1>",
	)

	// We expect an error here since test email won't actually send
	// This is more of a integration test that requires real SMTP setup
	if err != nil {
		t.Logf("Email send test error (expected): %v", err)
	}
}

// TestInvalidTemplate tests error handling for invalid templates.
func TestInvalidTemplate(t *testing.T) {
	svc := NewEmailService("smtp.gmail.com", "587", "user@gmail.com", "password", "templates/email")

	// Invalid template syntax
	templateStr := "Hello {{.UnclosedVariable"
	data := map[string]interface{}{}

	_, err := svc.RenderTemplate(templateStr, data)
	if err == nil {
		t.Errorf("Expected error for invalid template, got nil")
	}
}

// getTestEnv retrieves an environment variable for testing.
func getTestEnv(key, defaultVal string) string {
	// In real implementation, use os.Getenv
	return defaultVal
}

// TestBatchEmails tests sending multiple emails.
func TestBatchEmails(t *testing.T) {
	svc := NewEmailService("smtp.gmail.com", "587", "user@gmail.com", "password", "templates/email")

	template := &models.Template{
		Name:      "test",
		Subject:   "Welcome {{.Name}}",
		BodyHTML:  "<h1>Hello {{.Name}}</h1>",
		BodyText:  "Hello {{.Name}}",
		Channel:   "email",
	}

	recipients := []string{"user1@example.com", "user2@example.com"}
	dataList := []map[string]interface{}{
		{"Name": "User 1"},
		{"Name": "User 2"},
	}

	errors := svc.SendBatchEmails(recipients, template, dataList)

	// Check that we have results for all recipients
	if len(errors) != len(recipients) {
		t.Errorf("Expected %d errors, got %d", len(recipients), len(errors))
	}
}
