package com.quizapp.user_auth_service.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Configuration
@Slf4j
public class RabbitConfig {

	@Value("${app.notification.exchange}")
	private String notificationExchangeName;

	@Bean
	public MessageConverter jacksonMessageConverter() {
		ObjectMapper objectMapper = new ObjectMapper();
		objectMapper.registerModule(new JavaTimeModule());
		objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
		return new Jackson2JsonMessageConverter(objectMapper);
	}

	@Bean
	public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter messageConverter) {
		RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
		rabbitTemplate.setMessageConverter(messageConverter);
		// Publisher confirms/returns for observability
		rabbitTemplate.setConfirmCallback((correlationData, ack, cause) -> {
			if (ack) {
				log.info("RabbitMQ publish confirmed: correlationData={}", correlationData);
			} else {
				log.error("RabbitMQ publish NOT confirmed: correlationData={}, cause={}", correlationData, cause);
			}
		});
		rabbitTemplate.setReturnsCallback(returned -> {
			log.error("RabbitMQ returned message: replyCode={}, replyText={}, exchange={}, routingKey={}",
					returned.getReplyCode(), returned.getReplyText(), returned.getExchange(), returned.getRoutingKey());
		});
		return rabbitTemplate;
	}

	// Ensure the exchange exists so publish does not fail if notification service hasn't declared it yet
	@Bean
	public TopicExchange notificationExchange() {
		return new TopicExchange(notificationExchangeName, true, false);
	}
}


