package com.example.class_assignment_service.repository;

import com.example.class_assignment_service.model.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassRepository extends JpaRepository<ClassEntity, Long> {
    
    Optional<ClassEntity> findByInvitationCode(String invitationCode);
    
    // Find classes where user is a member (in class_members table)
    @Query("SELECT DISTINCT c FROM ClassEntity c JOIN c.members m WHERE m.userId = :userId")
    List<ClassEntity> findByUserId(@Param("userId") Long userId);
    
    // Find classes by role filter
    @Query("SELECT DISTINCT c FROM ClassEntity c LEFT JOIN c.members m WHERE " +
           "(:role = 'TEACHER' AND (c.teacherId = :userId OR (m.userId = :userId AND m.role = :role))) OR " +
           "(:role != 'TEACHER' AND m.userId = :userId AND m.role = :role)")
    List<ClassEntity> findByUserIdAndRole(@Param("userId") Long userId, @Param("role") String role);
    
    List<ClassEntity> findByStatus(String status);
    
    // Find classes where user is teacher (by teacher_id column) - Spring Data JPA auto-generated
    List<ClassEntity> findByTeacherId(Long teacherId);
}
