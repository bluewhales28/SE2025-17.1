package com.quizapp.user_auth_service.queue;

import com.quizapp.user_auth_service.dto.event.EmailEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailQueueProducer {

	private final RabbitTemplate rabbitTemplate;

	@Value("${app.notification.exchange}")
	private String notificationExchange;

	@Value("${app.notification.routingKey}")
	private String notificationRoutingKey;

	public void publishEmailEvent(EmailEvent event) {
		log.info("Publishing email event to exchange={}, routingKey={}, email={}", notificationExchange, notificationRoutingKey, event.getEmail());
		rabbitTemplate.convertAndSend(notificationExchange, notificationRoutingKey, event);
	}
}


