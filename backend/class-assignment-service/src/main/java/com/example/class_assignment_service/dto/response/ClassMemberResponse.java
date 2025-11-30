package com.example.class_assignment_service.dto.response;

import com.example.class_assignment_service.model.enums.MemberRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassMemberResponse {
    
    private Long id;
    private Long classId;
    private String className;
    private Long userId;
    private String userName;
    private MemberRole role;
    private LocalDateTime joinedAt;
    private Boolean isActive;
    private Boolean isBlocked;
}

