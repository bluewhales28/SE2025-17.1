package email

import (
	"bytes"
	"fmt"
	"net/smtp"
	"text/template"

	"github.com/bluewhales28/notification-service/models"
)

// EmailService handles email sending with template rendering support.
type EmailService struct {
	SMTPHost     string
	SMTPPort     string
	SMTPUser     string
	SMTPPassword string
	SenderEmail  string
}

// NewEmailService creates a new EmailService instance.
func NewEmailService(smtpHost, smtpPort, smtpUser, smtpPassword string) *EmailService {
	return &EmailService{
		SMTPHost:     smtpHost,
		SMTPPort:     smtpPort,
		SMTPUser:     smtpUser,
		SMTPPassword: smtpPassword,
		SenderEmail:  smtpUser, // Use SMTP user as sender email
	}
}

// RenderTemplate renders a template with the provided data using Go template engine.
// This supports dynamic content injection (e.g., user name, reset token, etc.)
func (es *EmailService) RenderTemplate(templateStr string, data map[string]interface{}) (string, error) {
	// Parse template string
	tmpl, err := template.New("email").Parse(templateStr)
	if err != nil {
		return "", fmt.Errorf("failed to parse template: %w", err)
	}

	// Render template with data
	var buffer bytes.Buffer
	err = tmpl.Execute(&buffer, data)
	if err != nil {
		return "", fmt.Errorf("failed to render template: %w", err)
	}

	return buffer.String(), nil
}

// SendEmail sends an email via SMTP to the specified recipient.
// It supports both plain text and HTML content.
func (es *EmailService) SendEmail(recipient, subject, bodyText, bodyHTML string) error {
	// Validate inputs
	if recipient == "" || subject == "" {
		return fmt.Errorf("recipient and subject cannot be empty")
	}

	// Build email message (MIME format)
	message := fmt.Sprintf(
		"From: %s\r\nTo: %s\r\nSubject: %s\r\nContent-Type: text/html; charset=\"UTF-8\"\r\n\r\n%s",
		es.SenderEmail, recipient, subject, bodyHTML,
	)

	// Connect to SMTP server and send
	addr := fmt.Sprintf("%s:%s", es.SMTPHost, es.SMTPPort)
	auth := smtp.PlainAuth("", es.SMTPUser, es.SMTPPassword, es.SMTPHost)

	err := smtp.SendMail(addr, auth, es.SenderEmail, []string{recipient}, []byte(message))
	if err != nil {
		return fmt.Errorf("failed to send email to %s: %w", recipient, err)
	}

	return nil
}

// SendBatchEmails sends emails to multiple recipients with template rendering.
// Returns a slice of errors for each failed send (nil if successful).
// This supports concurrent sending via worker pool patterns.
func (es *EmailService) SendBatchEmails(recipients []string, template *models.Template, dataList []map[string]interface{}) []error {
	errors := make([]error, len(recipients))

	// Iterate through recipients and render/send emails
	for i, recipient := range recipients {
		if i >= len(dataList) {
			errors[i] = fmt.Errorf("data mismatch: not enough data for recipient %d", i)
			continue
		}

		// Render email subject and body with template data
		subject, err := es.RenderTemplate(template.Subject, dataList[i])
		if err != nil {
			errors[i] = fmt.Errorf("failed to render subject for %s: %w", recipient, err)
			continue
		}

		body, err := es.RenderTemplate(template.BodyHTML, dataList[i])
		if err != nil {
			errors[i] = fmt.Errorf("failed to render body for %s: %w", recipient, err)
			continue
		}

		// Send email
		err = es.SendEmail(recipient, subject, "", body)
		if err != nil {
			errors[i] = err
		}
	}

	return errors
}
