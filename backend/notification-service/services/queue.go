package queue

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/bluewhales28/notification-service/models"
	"github.com/streadway/amqp"
	"gorm.io/gorm"
)

// Consumer listens to RabbitMQ queue for events from other microservices.
// It processes events and triggers notifications accordingly.
type Consumer struct {
	connection *amqp.Connection
	channel    *amqp.Channel
	queueName  string
	db         *gorm.DB
}

// NewConsumer creates a new RabbitMQ consumer with the given connection URL.
func NewConsumer(amqpURL, queueName string, db *gorm.DB) (*Consumer, error) {
	// Connect to RabbitMQ
	conn, err := amqp.Dial(amqpURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}

	// Create channel for queue operations
	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to open channel: %w", err)
	}

	// Declare queue (idempotent - won't fail if exists)
	_, err = ch.QueueDeclare(
		queueName, // name
		true,      // durable
		false,     // autoDelete
		false,     // exclusive
		false,     // noWait
		nil,       // arguments
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

// Listen starts consuming messages from the queue in a blocking loop.
// Each event is processed by creating a notification in the database.
func (c *Consumer) Listen(processFn func(*models.Event) error) error {
	// Get messages from queue
	messages, err := c.channel.Consume(
		c.queueName, // queue
		"",          // consumer (auto-generated)
		false,       // autoAck (manual acknowledgement)
		false,       // exclusive
		false,       // noLocal
		false,       // noWait
		nil,         // arguments
	)
	if err != nil {
		return fmt.Errorf("failed to register consumer: %w", err)
	}

	// Listen to messages in blocking loop
	for delivery := range messages {
		// Parse JSON event from message body
		var event models.Event
		err := json.Unmarshal(delivery.Body, &event)
		if err != nil {
			log.Printf("failed to unmarshal event: %v", err)
			// Negative acknowledge - will requeue the message
			delivery.Nack(false, true)
			continue
		}

		// Process event with custom handler function
		if processFn != nil {
			err = processFn(&event)
			if err != nil {
				log.Printf("failed to process event %s: %v, retrying...", event.ID, err)
				// Increment retry count and requeue
				event.Retry++
				if event.Retry < 3 {
					delivery.Nack(false, true) // Requeue
				} else {
					delivery.Ack(false) // Discard after 3 retries
				}
				continue
			}
		}

		// Acknowledge successful processing
		delivery.Ack(false)
	}

	return nil
}

// Close closes the RabbitMQ connection and channel.
func (c *Consumer) Close() error {
	if c.channel != nil {
		c.channel.Close()
	}
	if c.connection != nil {
		return c.connection.Close()
	}
	return nil
}

// PublishEvent publishes an event to the queue for testing/development.
func (c *Consumer) PublishEvent(event *models.Event) error {
	// Marshal event to JSON
	eventBytes, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal event: %w", err)
	}

	// Publish to queue
	err = c.channel.Publish(
		"",            // exchange (default)
		c.queueName,   // routing key (queue name)
		false,         // mandatory
		false,         // immediate
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
