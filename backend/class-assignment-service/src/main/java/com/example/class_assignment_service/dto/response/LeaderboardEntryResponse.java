package com.example.class_assignment_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntryResponse {
    
    private Long userId;
    private String userName;
    private Double totalScore;
    private Double averageScore;
    private Integer completedAssignments;
    private Integer totalAssignments;
    private Integer rank;
    private Double completionRate;
}

