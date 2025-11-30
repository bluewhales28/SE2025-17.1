package com.example.class_assignment_service.listener;

import com.example.class_assignment_service.model.StudentProgress;
import com.example.class_assignment_service.repository.StudentProgressRepository;
import com.example.class_assignment_service.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class QuizSubmittedListener {
    
    private final AssignmentService assignmentService;
    private final StudentProgressRepository progressRepository;
    
    @RabbitListener(queues = "quiz.submitted")
    public void handleQuizSubmitted(QuizSubmittedEvent event) {
        log.info("Received quiz submitted event: {}", event);
        
        // Find progress by quiz attempt ID
        StudentProgress progress = progressRepository
            .findByAttemptIdIsNotNull()
            .stream()
            .filter(p -> p.getAttemptId() != null && p.getAttemptId().equals(event.quizAttemptId()))
            .findFirst()
            .orElse(null);
        
        if (progress != null) {
            assignmentService.syncProgressScore(
                progress.getId(),
                event.quizAttemptId(),
                event.score() != null ? event.score().intValue() : 0
            );
        }
    }
    
    public record QuizSubmittedEvent(Long quizAttemptId, Long quizId, Long userId, 
                                     Double score, Double maxScore) {}
}

