package com.example.class_assignment_service.repository;

import com.example.class_assignment_service.model.StudentProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProgressRepository extends JpaRepository<StudentProgress, Long> {
    
    List<StudentProgress> findByAssignmentId(Long assignmentId);
    
    List<StudentProgress> findByStudentId(Long studentId);
    
    Optional<StudentProgress> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
    
    @Query("SELECT s FROM StudentProgress s WHERE s.assignment.classEntity.id = :classId")
    List<StudentProgress> findByClassId(@Param("classId") Long classId);
    
    @Query("SELECT s FROM StudentProgress s WHERE s.assignment.classEntity.id = :classId AND s.studentId = :studentId")
    List<StudentProgress> findByClassIdAndStudentId(@Param("classId") Long classId, @Param("studentId") Long studentId);
    
    List<StudentProgress> findByStatus(String status);
    
    List<StudentProgress> findByAttemptIdIsNotNull();
}

