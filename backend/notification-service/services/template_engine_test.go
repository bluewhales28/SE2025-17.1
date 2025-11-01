package services

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// TestNewTemplateEngine kiểm tra khởi tạo TemplateEngine.
func TestNewTemplateEngine(t *testing.T) {
	te := NewTemplateEngine("templates/email")
	if te.templateDir != "templates/email" {
		t.Errorf("expected templateDir to be 'templates/email', got %s", te.templateDir)
	}
	if te.cache == nil {
		t.Error("expected cache to be initialized")
	}
}

// TestLoadTemplate kiểm tra tải mẫu từ tệp.
func TestLoadTemplate(t *testing.T) {
	// Tạo thư mục tạm thời
	tmpDir := t.TempDir()

	// Tạo tệp mẫu
	templateContent := `Hello {{.Name}}, your code is {{.Code}}`
	templatePath := filepath.Join(tmpDir, "test.ejs")
	if err := os.WriteFile(templatePath, []byte(templateContent), 0644); err != nil {
		t.Fatalf("failed to create test template: %v", err)
	}

	// Tạo TemplateEngine
	te := NewTemplateEngine(tmpDir)

	// Tải mẫu
	tmpl, err := te.LoadTemplate("test")
	if err != nil {
		t.Fatalf("failed to load template: %v", err)
	}
	if tmpl == nil {
		t.Error("expected template to be loaded")
	}

	// Kiểm tra cache
	if cachedTmpl, exists := te.cache["test"]; !exists || cachedTmpl != tmpl {
		t.Error("expected template to be cached")
	}
}

// TestLoadTemplateMissing kiểm tra tải mẫu không tồn tại.
func TestLoadTemplateMissing(t *testing.T) {
	tmpDir := t.TempDir()
	te := NewTemplateEngine(tmpDir)

	_, err := te.LoadTemplate("nonexistent")
	if err == nil {
		t.Error("expected error when loading nonexistent template")
	}
	if !strings.Contains(err.Error(), "mẫu không tìm thấy") {
		t.Errorf("expected 'mẫu không tìm thấy' error, got: %v", err)
	}
}

// TestRenderTemplate kiểm tra hiển thị mẫu với dữ liệu.
func TestRenderTemplate(t *testing.T) {
	// Tạo thư mục tạm thời
	tmpDir := t.TempDir()

	// Tạo tệp mẫu
	templateContent := `Hello {{.Name}}, your verification code is {{.Code}}`
	templatePath := filepath.Join(tmpDir, "welcome.ejs")
	if err := os.WriteFile(templatePath, []byte(templateContent), 0644); err != nil {
		t.Fatalf("failed to create test template: %v", err)
	}

	// Tạo TemplateEngine
	te := NewTemplateEngine(tmpDir)

	// Hiển thị mẫu
	data := map[string]interface{}{
		"Name": "John",
		"Code": "123456",
	}
	result, err := te.RenderTemplate("welcome", data)
	if err != nil {
		t.Fatalf("failed to render template: %v", err)
	}

	// Kiểm tra kết quả
	expected := "Hello John, your verification code is 123456"
	if result != expected {
		t.Errorf("expected '%s', got '%s'", expected, result)
	}
}

// TestRenderTemplateWithCondition kiểm tra hiển thị mẫu với điều kiện.
func TestRenderTemplateWithCondition(t *testing.T) {
	// Tạo thư mục tạm thời
	tmpDir := t.TempDir()

	// Tạo tệp mẫu với điều kiện
	templateContent := `{{if .IsAdmin}}Welcome Admin{{else}}Welcome User{{end}}`
	templatePath := filepath.Join(tmpDir, "role.ejs")
	if err := os.WriteFile(templatePath, []byte(templateContent), 0644); err != nil {
		t.Fatalf("failed to create test template: %v", err)
	}

	// Tạo TemplateEngine
	te := NewTemplateEngine(tmpDir)

	// Kiểm tra cho Admin
	result, err := te.RenderTemplate("role", map[string]interface{}{"IsAdmin": true})
	if err != nil {
		t.Fatalf("failed to render template: %v", err)
	}
	if result != "Welcome Admin" {
		t.Errorf("expected 'Welcome Admin', got '%s'", result)
	}

	// Xóa cache
	te.ClearCache()

	// Kiểm tra cho User
	result, err = te.RenderTemplate("role", map[string]interface{}{"IsAdmin": false})
	if err != nil {
		t.Fatalf("failed to render template: %v", err)
	}
	if result != "Welcome User" {
		t.Errorf("expected 'Welcome User', got '%s'", result)
	}
}

// TestListTemplates kiểm tra liệt kê các mẫu có sẵn.
func TestListTemplates(t *testing.T) {
	// Tạo thư mục tạm thời
	tmpDir := t.TempDir()

	// Tạo các tệp mẫu
	templates := []string{"welcome.ejs", "reset.ejs", "badge.html"}
	for _, tmpl := range templates {
		templatePath := filepath.Join(tmpDir, tmpl)
		if err := os.WriteFile(templatePath, []byte("content"), 0644); err != nil {
			t.Fatalf("failed to create test template: %v", err)
		}
	}

	// Tạo file không phải mẫu (phải bị bỏ qua)
	ignorePath := filepath.Join(tmpDir, "README.md")
	if err := os.WriteFile(ignorePath, []byte("content"), 0644); err != nil {
		t.Fatalf("failed to create ignore file: %v", err)
	}

	// Tạo TemplateEngine
	te := NewTemplateEngine(tmpDir)

	// Liệt kê mẫu
	result, err := te.ListTemplates()
	if err != nil {
		t.Fatalf("failed to list templates: %v", err)
	}

	// Kiểm tra số lượng mẫu
	if len(result) != 3 {
		t.Errorf("expected 3 templates, got %d: %v", len(result), result)
	}

	// Kiểm tra tên mẫu
	expectedNames := map[string]bool{"welcome": false, "reset": false, "badge": false}
	for _, name := range result {
		if _, exists := expectedNames[name]; !exists {
			t.Errorf("unexpected template name: %s", name)
		}
		expectedNames[name] = true
	}

	// Kiểm tra tất cả các mẫu được tìm thấy
	for name, found := range expectedNames {
		if !found {
			t.Errorf("expected template '%s' not found", name)
		}
	}
}

// TestClearCache kiểm tra xóa cache.
func TestClearCache(t *testing.T) {
	// Tạo thư mục tạm thời
	tmpDir := t.TempDir()

	// Tạo tệp mẫu
	templatePath := filepath.Join(tmpDir, "test.ejs")
	if err := os.WriteFile(templatePath, []byte("content {{.Name}}"), 0644); err != nil {
		t.Fatalf("failed to create test template: %v", err)
	}

	// Tạo TemplateEngine
	te := NewTemplateEngine(tmpDir)

	// Tải mẫu
	_, err := te.LoadTemplate("test")
	if err != nil {
		t.Fatalf("failed to load template: %v", err)
	}

	// Kiểm tra cache không trống
	if len(te.cache) != 1 {
		t.Error("expected cache to have 1 item")
	}

	// Xóa cache
	te.ClearCache()

	// Kiểm tra cache trống
	if len(te.cache) != 0 {
		t.Error("expected cache to be cleared")
	}
}

// TestGetTemplatePath kiểm tra lấy đường dẫn mẫu.
func TestGetTemplatePath(t *testing.T) {
	te := NewTemplateEngine("templates/email")
	path := te.GetTemplatePath("welcome")
	// Sử dụng filepath.Join để xây dựng đường dẫn dự kiến (hỗ trợ cả Windows và Unix)
	expected := filepath.Join("templates/email", "welcome.ejs")
	if path != expected {
		t.Errorf("expected '%s', got '%s'", expected, path)
	}
}
