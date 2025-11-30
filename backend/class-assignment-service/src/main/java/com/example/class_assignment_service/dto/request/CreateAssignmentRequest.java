package com.example.class_assignment_service.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAssignmentRequest {
    
    @NotNull(message = "Quiz ID is required")
    private Long quizId;
    
    @NotNull(message = "Class ID is required")
    private Long classId;
    
    @NotNull(message = "Title is required")
    @Size(min = 1, max = 255, message = "Title must be between 1 and 255 characters")
    private String title;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    private LocalDateTime openTime;
    
    @Future(message = "Close time must be in the future")
    private LocalDateTime closeTime;
    
    @NotNull(message = "Deadline is required")
    @Future(message = "Deadline must be in the future")
    private LocalDateTime deadline;
    
    @Min(value = 1, message = "Max attempts must be at least 1")
    private Integer maxAttempts;
    
    private Boolean allowRetake;
}

