package com.example.class_assignment_service.dto.response;

import com.example.class_assignment_service.model.enums.ClassStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassResponse {
    
    private Long id;
    private String name;
    private String description;
    private String subject;
    private ClassStatus status;
    private String invitationCode;
    private String invitationLink;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer memberCount;
    private Integer assignmentCount;
}

