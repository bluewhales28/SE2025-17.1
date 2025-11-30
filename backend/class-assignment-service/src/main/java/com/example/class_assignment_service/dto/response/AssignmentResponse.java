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
public class AssignmentResponse {
    
    private Long id;
    private Long classId;
    private String className;
    private Long quizId;
    private String title;
    private String description;
    private LocalDateTime openTime;
    private LocalDateTime closeTime;
    private LocalDateTime deadline;
    private Integer maxAttempts;
    private Boolean allowRetake;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private AssignmentStatus userStatus; // Status for the current user
    private Integer userAttemptCount; // Number of attempts by current user
}

