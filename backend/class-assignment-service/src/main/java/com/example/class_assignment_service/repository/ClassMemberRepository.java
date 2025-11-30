package com.example.class_assignment_service.repository;

import com.example.class_assignment_service.model.ClassMember;
import com.example.class_assignment_service.model.enums.ClassRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassMemberRepository extends JpaRepository<ClassMember, Long> {
    
    Optional<ClassMember> findByClassEntityIdAndUserId(Long classId, Long userId);
    
    List<ClassMember> findByClassEntityId(Long classId);
    
    List<ClassMember> findByUserId(Long userId);
    
    List<ClassMember> findByClassEntityIdAndRole(Long classId, ClassRole role);
    
    @Query("SELECT COUNT(m) FROM ClassMember m WHERE m.classEntity.id = :classId AND m.role = :role")
    Long countByClassIdAndRole(@Param("classId") Long classId, @Param("role") ClassRole role);
    
    boolean existsByClassEntityIdAndUserId(Long classId, Long userId);
}
