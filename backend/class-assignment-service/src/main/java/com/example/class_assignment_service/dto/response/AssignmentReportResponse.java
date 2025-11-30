package com.example.class_assignment_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentReportResponse {
    
    private Long assignmentId;
    private String assignmentTitle;
    private LocalDateTime deadline;
    private Integer totalSubmissions;
    private Integer totalStudents;
    private Double averageScore;
    private Double maxScore;
    private Double minScore;
    private Double completionRate;
}

