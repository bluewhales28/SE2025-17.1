package com.example.class_assignment_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"assignment_id", "student_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProgress extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;
    
    @Column(name = "student_id", nullable = false)
    private Long studentId;
    
    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "NOT_STARTED";
    
    @Column(name = "score")
    @Builder.Default
    private Integer score = 0;
    
    @Column(name = "last_updated")
    @Builder.Default
    private LocalDateTime lastUpdated = LocalDateTime.now();
    
    // Reference to quiz attempt if submitted
    @Column(name = "attempt_id")
    private Long attemptId;
}

