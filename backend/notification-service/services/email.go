package email

import (
	"bytes"
	"fmt"
	"net/smtp"
	"text/template"

	"github.com/bluewhales28/notification-service/models"
)

// EmailService xử lý gửi email hỗ trợ hiển thị mẫu động từ cơ sở dữ liệu hoặc tệp hệ thống.
type EmailService struct {
	SMTPHost       string
	SMTPPort       string
	SMTPUser       string
	SMTPPassword   string
	SenderEmail    string
	TemplateEngine *TemplateEngine // Engine cho các mẫu tệp hệ thống
}

// NewEmailService tạo một phiên bản EmailService mới với hỗ trợ mẫu tệp hệ thống.
func NewEmailService(smtpHost, smtpPort, smtpUser, smtpPassword, templateDir string) *EmailService {
	return &EmailService{
		SMTPHost:       smtpHost,
		SMTPPort:       smtpPort,
		SMTPUser:       smtpUser,
		SMTPPassword:   smtpPassword,
		SenderEmail:    smtpUser, // Sử dụng người dùng SMTP làm email người gửi
		TemplateEngine: NewTemplateEngine(templateDir),
	}
}

// RenderTemplate hiển thị một mẫu với dữ liệu được cung cấp bằng máy tạo mẫu Go.
// Điều này hỗ trợ tiêm nội dung động (VD: tên người dùng, mã tạo lại, v.v.)
func (es *EmailService) RenderTemplate(templateStr string, data map[string]interface{}) (string, error) {
	// Phân tích chuỗi mẫu
	tmpl, err := template.New("email").Parse(templateStr)
	if err != nil {
		return "", fmt.Errorf("failed to parse template: %w", err)
	}

	// Hiển thị mẫu với dữ liệu
	var buffer bytes.Buffer
	err = tmpl.Execute(&buffer, data)
	if err != nil {
		return "", fmt.Errorf("failed to render template: %w", err)
	}

	return buffer.String(), nil
}

// RenderFileTemplate hiển thị một mẫu từ hệ thống tệp (EJS hoặc HTML).
// Trả về nội dung HTML được hiển thị.
func (es *EmailService) RenderFileTemplate(templateName string, data map[string]interface{}) (string, error) {
	return es.TemplateEngine.RenderTemplate(templateName, data)
}

// GetAvailableTemplates liệt kê tất cả các mẫu tệp có sẵn.
func (es *EmailService) GetAvailableTemplates() ([]string, error) {
	return es.TemplateEngine.ListTemplates()
}

// SendEmail gửi email thông qua SMTP tới người nhận được chỉ định.
// Nó hỗ trợ cả nội dung văn bản thuần và HTML.
func (es *EmailService) SendEmail(recipient, subject, bodyText, bodyHTML string) error {
	// Xác thực đầu vào
	if recipient == "" || subject == "" {
		return fmt.Errorf("recipient and subject cannot be empty")
	}

	// Xây dựng thông báo email (định dạng MIME)
	message := fmt.Sprintf(
		"From: %s\r\nTo: %s\r\nSubject: %s\r\nContent-Type: text/html; charset=\"UTF-8\"\r\n\r\n%s",
		es.SenderEmail, recipient, subject, bodyHTML,
	)

	// Kết nối tới máy chủ SMTP và gửi
	addr := fmt.Sprintf("%s:%s", es.SMTPHost, es.SMTPPort)
	auth := smtp.PlainAuth("", es.SMTPUser, es.SMTPPassword, es.SMTPHost)

	err := smtp.SendMail(addr, auth, es.SenderEmail, []string{recipient}, []byte(message))
	if err != nil {
		return fmt.Errorf("failed to send email to %s: %w", recipient, err)
	}

	return nil
}

// SendBatchEmails gửi email tới nhiều người nhận bằng hiển thị mẫu.
// Trả về một lát các lỗi cho mỗi lần gửi bị lỗi (nil nếu thành công).
// Điều này hỗ trợ gửi đồng thời thông qua các mô hình hồ bơi worker.
func (es *EmailService) SendBatchEmails(recipients []string, template *models.Template, dataList []map[string]interface{}) []error {
	errors := make([]error, len(recipients))

	// Lặp lại các người nhận và hiển thị/gửi email
	for i, recipient := range recipients {
		if i >= len(dataList) {
			errors[i] = fmt.Errorf("data mismatch: not enough data for recipient %d", i)
			continue
		}

		// Hiển thị tiêu đề email và nội dung với dữ liệu mẫu
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

		// Gửi email
		err = es.SendEmail(recipient, subject, "", body)
		if err != nil {
			errors[i] = err
		}
	}

	return errors
}
