package services

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"text/template"
)

// TemplateEngine quản lý việc tải và hiển thị các mẫu email từ tệp.
// Hỗ trợ cả tệp EJS thô (HTML) và mẫu Go template.
type TemplateEngine struct {
	templateDir string // Thư mục chứa các mẫu (VD: templates/email/)
	cache       map[string]*template.Template // Cache các mẫu đã được phân tích
}

// NewTemplateEngine tạo một engine mẫu mới với thư mục được chỉ định.
func NewTemplateEngine(templateDir string) *TemplateEngine {
	return &TemplateEngine{
		templateDir: templateDir,
		cache:       make(map[string]*template.Template),
	}
}

// LoadTemplate tải một mẫu từ tệp và lưu vào cache.
// Hỗ trợ cả .ejs và .html
func (te *TemplateEngine) LoadTemplate(templateName string) (*template.Template, error) {
	// Kiểm tra cache trước
	if tmpl, exists := te.cache[templateName]; exists {
		return tmpl, nil
	}

	// Tìm kiếm tệp mẫu (.ejs hoặc .html)
	ejsPath := filepath.Join(te.templateDir, templateName+".ejs")
	htmlPath := filepath.Join(te.templateDir, templateName+".html")

	var filePath string
	if _, err := os.Stat(ejsPath); err == nil {
		filePath = ejsPath
	} else if _, err := os.Stat(htmlPath); err == nil {
		filePath = htmlPath
	} else {
		return nil, fmt.Errorf("mẫu không tìm thấy: %s (tìm kiếm: %s, %s)", templateName, ejsPath, htmlPath)
	}

	// Đọc nội dung tệp
	content, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("lỗi đọc mẫu %s: %w", filePath, err)
	}

	// Phân tích mẫu Go (EJS là cú pháp HTML với <%= %> tương tự Go template)
	tmpl, err := template.New(templateName).Parse(string(content))
	if err != nil {
		return nil, fmt.Errorf("lỗi phân tích mẫu %s: %w", templateName, err)
	}

	// Lưu vào cache
	te.cache[templateName] = tmpl

	return tmpl, nil
}

// RenderTemplate hiển thị một mẫu với dữ liệu được cung cấp.
// Trả về HTML được hiển thị dưới dạng chuỗi.
func (te *TemplateEngine) RenderTemplate(templateName string, data map[string]interface{}) (string, error) {
	// Tải mẫu
	tmpl, err := te.LoadTemplate(templateName)
	if err != nil {
		return "", err
	}

	// Hiển thị mẫu với dữ liệu
	var result strings.Builder
	err = tmpl.Execute(&result, data)
	if err != nil {
		return "", fmt.Errorf("lỗi hiển thị mẫu %s: %w", templateName, err)
	}

	return result.String(), nil
}

// ListTemplates liệt kê tất cả các mẫu có sẵn trong thư mục.
func (te *TemplateEngine) ListTemplates() ([]string, error) {
	var templates []string

	// Đọc thư mục
	entries, err := os.ReadDir(te.templateDir)
	if err != nil {
		return nil, fmt.Errorf("lỗi đọc thư mục mẫu: %w", err)
	}

	// Lặp qua tất cả các tệp
	for _, entry := range entries {
		if !entry.IsDir() {
			name := entry.Name()
			// Chỉ chọn .ejs và .html
			if strings.HasSuffix(name, ".ejs") || strings.HasSuffix(name, ".html") {
				// Loại bỏ phần mở rộng để lấy tên mẫu
				templateName := strings.TrimSuffix(name, filepath.Ext(name))
				templates = append(templates, templateName)
			}
		}
	}

	return templates, nil
}

// ClearCache xóa tất cả các mẫu trong cache (hữu ích cho development).
func (te *TemplateEngine) ClearCache() {
	te.cache = make(map[string]*template.Template)
}

// GetTemplatePath trả về đường dẫn đầy đủ của một mẫu.
func (te *TemplateEngine) GetTemplatePath(templateName string) string {
	return filepath.Join(te.templateDir, templateName+".ejs")
}
