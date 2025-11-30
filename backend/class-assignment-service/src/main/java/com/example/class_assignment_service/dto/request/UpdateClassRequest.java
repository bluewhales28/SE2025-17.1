package com.example.class_assignment_service.dto.request;

import com.example.class_assignment_service.model.enums.ClassStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateClassRequest {
    
    @Size(min = 1, max = 255, message = "Class name must be between 1 and 255 characters")
    private String name;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    @Size(max = 100, message = "Subject must not exceed 100 characters")
    private String subject;
    
    private ClassStatus status;
}
