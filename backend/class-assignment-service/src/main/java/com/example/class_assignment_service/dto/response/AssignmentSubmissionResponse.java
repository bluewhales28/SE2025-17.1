package com.example.class_assignment_service.dto.response;

import com.example.class_assignment_service.model.enums.AssignmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentSubmissionResponse {
    
    private Long id;
    private Long assignmentId;
    private String assignmentTitle;
    private Long userId;
    private Long quizAttemptId;
    private AssignmentStatus status;
    private Double score;
    private Double maxScore;
    private Double percentage;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer attemptNumber;
    private Boolean isSynced;
}

