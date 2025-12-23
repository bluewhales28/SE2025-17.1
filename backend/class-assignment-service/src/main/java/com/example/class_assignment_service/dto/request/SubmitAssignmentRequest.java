package com.example.class_assignment_service.dto.request;

import lombok.Data;

@Data
public class SubmitAssignmentRequest {
    private Long attemptId;
    private Double score;
}

