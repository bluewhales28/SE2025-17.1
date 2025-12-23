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
public class QuizServiceClient {
    
    private final WebClient.Builder webClientBuilder;
    
    @Value("${services.quiz-service.url:http://localhost:8082}")
    private String quizServiceUrl;
    
    private WebClient getWebClient() {
        return webClientBuilder
            .baseUrl(quizServiceUrl)
            .build();
    }
    
    public QuizInfo getQuizInfo(Long quizId) {
        try {
            return getWebClient()
                .get()
                .uri("/quizzes/{id}", quizId)
                .retrieve()
                .onStatus(status -> status.is4xxClientError(), response -> {
                    log.error("Quiz not found: {}", quizId);
                    return Mono.error(new AppException(ErrorCode.QUIZ_NOT_FOUND));
                })
                .onStatus(status -> status.is5xxServerError(), response -> {
                    log.error("Quiz Service error for quiz: {}", quizId);
                    return Mono.error(new AppException(ErrorCode.QUIZ_SERVICE_ERROR));
                })
                .bodyToMono(QuizInfo.class)
                .timeout(Duration.ofSeconds(5))
                .block();
        } catch (Exception e) {
            log.error("Error calling Quiz Service: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.QUIZ_SERVICE_ERROR, "Failed to fetch quiz info", e);
        }
    }
    
    public QuizAttemptResult getQuizAttemptResult(Long attemptId) {
        try {
            return getWebClient()
                .get()
                .uri("/api/quiz-attempts/{id}", attemptId)
                .retrieve()
                .onStatus(status -> status.is4xxClientError(), response -> {
                    log.error("Quiz attempt not found: {}", attemptId);
                    return Mono.error(new AppException(ErrorCode.QUIZ_NOT_FOUND));
                })
                .onStatus(status -> status.is5xxServerError(), response -> {
                    log.error("Quiz Service error for attempt: {}", attemptId);
                    return Mono.error(new AppException(ErrorCode.QUIZ_SERVICE_ERROR));
                })
                .bodyToMono(QuizAttemptResult.class)
                .timeout(Duration.ofSeconds(5))
                .block();
        } catch (Exception e) {
            log.error("Error calling Quiz Service: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.QUIZ_SERVICE_ERROR, "Failed to fetch quiz attempt", e);
        }
    }
    
    public record QuizInfo(Long id, String title, String description, Integer totalQuestions, Double maxScore) {}
    
    public record QuizAttemptResult(Long id, Long quizId, Long userId, Double score, Double maxScore, 
                                    String status, java.time.LocalDateTime submittedAt) {}
}

