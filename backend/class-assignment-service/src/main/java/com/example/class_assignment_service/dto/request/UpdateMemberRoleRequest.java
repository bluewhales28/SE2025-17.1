package com.example.class_assignment_service.dto.request;

import com.example.class_assignment_service.model.enums.MemberRole;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMemberRoleRequest {
    
    @NotNull(message = "Role is required")
    private MemberRole role;
}

