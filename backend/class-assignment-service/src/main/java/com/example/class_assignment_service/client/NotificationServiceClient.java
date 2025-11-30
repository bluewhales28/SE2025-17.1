package com.example.class_assignment_service.client;

import com.example.class_assignment_service.exception.AppException;
import com.example.class_assignment_service.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationServiceClient {
    
    private final WebClient.Builder webClientBuilder;
    
    @Value("${services.notification-service.url:http://localhost:8083}")
    private String notificationServiceUrl;
    
    private WebClient getWebClient() {
        return webClientBuilder
            .baseUrl(notificationServiceUrl)
            .build();
    }
    
    public void sendNotification(NotificationRequest request) {
        try {
            getWebClient()
                .post()
                .uri("/notifications")
                .bodyValue(request)
                .retrieve()
                .onStatus(status -> status.is5xxServerError(), response -> {
                    log.error("Notification Service error");
                    return Mono.error(new AppException(ErrorCode.NOTIFICATION_SERVICE_ERROR));
                })
                .bodyToMono(Void.class)
                .timeout(Duration.ofSeconds(5))
                .block();
        } catch (Exception e) {
            log.error("Error calling Notification Service: {}", e.getMessage(), e);
            // Don't throw exception, just log - notification failure shouldn't break main flow
        }
    }
    
    public void sendClassInvitation(Long userId, String email, String className, String invitationCode) {
        NotificationRequest request = NotificationRequest.builder()
            .userId(userId)
            .email(email)
            .type("class_invitation")
            .subject("Invitation to join class: " + className)
            .data(Map.of(
                "className", className,
                "invitationCode", invitationCode,
                "type", "class_invitation"
            ))
            .build();
        sendNotification(request);
    }
    
    public void sendAssignmentNotification(Long userId, String email, String assignmentTitle, String className, 
                                          java.time.LocalDateTime deadline) {
        NotificationRequest request = NotificationRequest.builder()
            .userId(userId)
            .email(email)
            .type("quiz_assigned")
            .subject("New assignment: " + assignmentTitle)
            .data(Map.of(
                "assignmentTitle", assignmentTitle,
                "className", className,
                "deadline", deadline.toString(),
                "type", "quiz_assigned"
            ))
            .build();
        sendNotification(request);
    }
    
    public void sendDeadlineReminder(Long userId, String email, String assignmentTitle, String className,
                                     java.time.LocalDateTime deadline) {
        NotificationRequest request = NotificationRequest.builder()
            .userId(userId)
            .email(email)
            .type("deadline_reminder")
            .subject("Deadline reminder: " + assignmentTitle)
            .data(Map.of(
                "assignmentTitle", assignmentTitle,
                "className", className,
                "deadline", deadline.toString(),
                "type", "deadline_reminder"
            ))
            .build();
        sendNotification(request);
    }
    
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class NotificationRequest {
        private Long userId;
        private String email;
        private String type;
        private String subject;
        private Map<String, Object> data;
    }
}

