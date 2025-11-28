package com.quizapp.user_auth_service.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;

/**
 * Notification Client để tích hợp với Notification Service
 * Gửi các sự kiện người dùng để tạo thông báo
 */
@Slf4j
@Service
public class NotificationClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.notification.service-url}")
    private String notificationServiceUrl;

    public NotificationClient(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Gửi thông báo đón chào cho người dùng mới
     */
    public void sendWelcomeNotification(Long userId, String email, String fullName) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("user_id", userId);
            notification.put("type", "welcome");
            notification.put("title", "Chào mừng đến QuizMaster");
            notification.put("content", "Cảm ơn bạn đã đăng ký tài khoản");
            notification.put("channel", "email");

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("recipient_email", email);
            metadata.put("UserName", fullName);
            notification.put("metadata", metadata);

            sendNotification(notification);
            log.info("Welcome notification sent for user: {}", email);
        } catch (Exception e) {
            log.error("Failed to send welcome notification for user: {}", email, e);
        }
    }

    /**
     * Gửi thông báo reset mật khẩu
     */
    public void sendPasswordResetNotification(Long userId, String email, String fullName, String resetToken) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("user_id", userId);
            notification.put("type", "reset_password");
            notification.put("title", "Đặt lại mật khẩu");
            notification.put("content", "Yêu cầu đặt lại mật khẩu của bạn");
            notification.put("channel", "email");

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("recipient_email", email);
            metadata.put("UserName", fullName);
            metadata.put("resetToken", resetToken);
            notification.put("metadata", metadata);

            sendNotification(notification);
            log.info("Password reset notification sent for user: {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset notification for user: {}", email, e);
        }
    }

    /**
     * Gửi thông báo xác minh email
     */
    public void sendEmailVerificationNotification(Long userId, String email, String fullName, String verificationToken) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("user_id", userId);
            notification.put("type", "email_verification");
            notification.put("title", "Xác minh địa chỉ email");
            notification.put("content", "Vui lòng xác minh địa chỉ email của bạn");
            notification.put("channel", "email");

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("recipient_email", email);
            metadata.put("UserName", fullName);
            metadata.put("verificationToken", verificationToken);
            notification.put("metadata", metadata);

            sendNotification(notification);
            log.info("Email verification notification sent for user: {}", email);
        } catch (Exception e) {
            log.error("Failed to send email verification notification for user: {}", email, e);
        }
    }

    /**
     * Gửi thông báo in-app chung
     */
    public void sendInAppNotification(Long userId, String title, String content) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("user_id", userId);
            notification.put("type", "info");
            notification.put("title", title);
            notification.put("content", content);
            notification.put("channel", "in_app");
            notification.put("metadata", new HashMap<>());

            sendNotification(notification);
            log.info("In-app notification sent for user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to send in-app notification for user: {}", userId, e);
        }
    }

    /**
     * Gửi thông báo chung
     */
    private void sendNotification(Map<String, Object> notification) {
        try {
            String url = notificationServiceUrl + "/notifications";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String jsonBody = objectMapper.writeValueAsString(notification);
            HttpEntity<String> request = new HttpEntity<>(jsonBody, headers);

            restTemplate.postForObject(url, request, String.class);
            log.debug("Notification sent to: {}", url);
        } catch (Exception e) {
            log.error("Failed to send notification", e);
            // Không ném exception để không làm ảnh hưởng đến quy trình chính
        }
    }
}
