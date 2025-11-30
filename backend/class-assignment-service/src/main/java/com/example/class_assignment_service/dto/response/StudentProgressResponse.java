package com.example.class_assignment_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProgressResponse {
    
    private Long userId;
    private String userName;
    private Integer completedAssignments;
    private Integer totalAssignments;
    private Double averageScore;
    private Double totalScore;
    private Double completionRate;
}

