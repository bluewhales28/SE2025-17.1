package com.example.class_assignment_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    
    public static final String QUIZ_SUBMITTED_QUEUE = "quiz.submitted";
    public static final String DEADLINE_REMINDER_QUEUE = "deadline.reminder";
    public static final String DEADLINE_REMINDER_EXCHANGE = "deadline.reminder.exchange";
    
    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
    
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
    
    @Bean
    public Queue quizSubmittedQueue() {
        return QueueBuilder.durable(QUIZ_SUBMITTED_QUEUE).build();
    }
    
    @Bean
    public Queue deadlineReminderQueue() {
        return QueueBuilder.durable(DEADLINE_REMINDER_QUEUE).build();
    }
    
    @Bean
    public TopicExchange deadlineReminderExchange() {
        return new TopicExchange(DEADLINE_REMINDER_EXCHANGE);
    }
    
    @Bean
    public Binding deadlineReminderBinding() {
        return BindingBuilder
            .bind(deadlineReminderQueue())
            .to(deadlineReminderExchange())
            .with("deadline.reminder.*");
    }
}

