package com.example.class_assignment_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardResponse {
    
    private Long classId;
    private String className;
    private List<LeaderboardEntryResponse> entries;
    private Integer totalStudents;
    private Integer totalAssignments;
}

