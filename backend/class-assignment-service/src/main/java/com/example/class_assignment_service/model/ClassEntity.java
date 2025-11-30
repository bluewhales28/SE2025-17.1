package com.example.class_assignment_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "classes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassEntity extends BaseEntity {
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "topic", length = 100)
    private String topic;
    
    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "ACTIVE";
    
    @Column(name = "teacher_id")
    private Long teacherId;
    
    @Column(name = "invitation_code", length = 20, unique = true)
    private String invitationCode;
    
    @OneToMany(mappedBy = "classEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ClassMember> members = new ArrayList<>();
    
    @OneToMany(mappedBy = "classEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Assignment> assignments = new ArrayList<>();
}
