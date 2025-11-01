package services

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/bluewhales28/notification-service/models"
	"github.com/streadway/amqp"
	"gorm.io/gorm"
)

// Consumer lắng nghe hàng đợi RabbitMQ để nhận sự kiện từ các microservice khác.
// Nó xử lý các sự kiện và kích hoạt thông báo cho phù hợp.
type Consumer struct {
	connection *amqp.Connection
	channel    *amqp.Channel
	queueName  string
	db         *gorm.DB
}

// NewConsumer tạo một consumer RabbitMQ mới với URL kết nối được cung cấp.
func NewConsumer(amqpURL, queueName string, db *gorm.DB) (*Consumer, error) {
	// Kết nối tới RabbitMQ
	conn, err := amqp.Dial(amqpURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}

	// Tạo kênh cho các hoạt động hàng đợi
	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to open channel: %w", err)
	}

	// Khai báo hàng đợi (idempotent - không thất bại nếu tồn tại)
	_, err = ch.QueueDeclare(
		queueName, // tên
		true,      // bền vững
		false,     // autoDelete
		false,     // độc quyền
		false,     // noWait
		nil,       // tham số
	)
	if err != nil {
		ch.Close()
		conn.Close()
		return nil, fmt.Errorf("failed to declare queue: %w", err)
	}

	return &Consumer{
		connection: conn,
		channel:    ch,
		queueName:  queueName,
		db:         db,
	}, nil
}

// Listen bắt đầu tiêu thụ tin nhắn từ hàng đợi trong vòng lặp chặn.
// Mỗi sự kiện được xử lý bằng cách tạo thông báo trong cơ sở dữ liệu.
func (c *Consumer) Listen(processFn func(*models.Event) error) error {
	// Nhận tin nhắn từ hàng đợi
	messages, err := c.channel.Consume(
		c.queueName, // hàng đợi
		"",          // consumer (tự động tạo)
		false,       // autoAck (xác nhận thручное)
		false,       // độc quyền
		false,       // noLocal
		false,       // noWait
		nil,         // tham số
	)
	if err != nil {
		return fmt.Errorf("failed to register consumer: %w", err)
	}

	// Lắng nghe tin nhắn trong vòng lặp chặn
	for delivery := range messages {
		// Phân tích chuỗi sự kiện JSON từ nội dung tin nhắn
		var event models.Event
		err := json.Unmarshal(delivery.Body, &event)
		if err != nil {
			log.Printf("failed to unmarshal event: %v", err)
			// Phủ định xác nhận - sẽ đưa lại tin nhắn vào hàng đợi
			delivery.Nack(false, true)
			continue
		}

		// Xử lý sự kiện bằng hàm xử lý tùy chỉnh
		if processFn != nil {
			err = processFn(&event)
			if err != nil {
				log.Printf("failed to process event %s: %v, retrying...", event.ID, err)
				// Tăng số lần thử lại và đưa lại vào hàng đợi
				event.Retry++
				if event.Retry < 3 {
					delivery.Nack(false, true) // Đưa lại vào hàng đợi
				} else {
					delivery.Ack(false) // Loại bỏ sau 3 lần thử
				}
				continue
			}
		}

		// Xác nhận xử lý thành công
		delivery.Ack(false)
	}

	return nil
}

// Close đóng kết nối RabbitMQ và kênh.
func (c *Consumer) Close() error {
	if c.channel != nil {
		c.channel.Close()
	}
	if c.connection != nil {
		return c.connection.Close()
	}
	return nil
}

// PublishEvent xuất bản một sự kiện vào hàng đợi để kiểm tra/phát triển.
func (c *Consumer) PublishEvent(event *models.Event) error {
	// Sắp xếp sự kiện thành JSON
	eventBytes, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal event: %w", err)
	}

	// Xuất bản vào hàng đợi
	err = c.channel.Publish(
		"",            // exchange (mặc định)
		c.queueName,   // routing key (tên hàng đợi)
		false,         // bắt buộc
		false,         // tức thì
		amqp.Publishing{
			ContentType: "application/json",
			Body:        eventBytes,
		},
	)
	if err != nil {
		return fmt.Errorf("failed to publish event: %w", err)
	}

	return nil
}
