package com.example.class_assignment_service.repository;

import com.example.class_assignment_service.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    
    List<Assignment> findByClassEntityId(Long classId);
    
    List<Assignment> findByQuizId(Long quizId);
    
    @Query("SELECT a FROM Assignment a WHERE a.classEntity.id = :classId AND a.dueTime >= :now")
    List<Assignment> findActiveAssignmentsByClassId(@Param("classId") Long classId, @Param("now") LocalDateTime now);
    
    @Query("SELECT a FROM Assignment a WHERE a.dueTime < :now")
    List<Assignment> findOverdueAssignments(@Param("now") LocalDateTime now);
}
