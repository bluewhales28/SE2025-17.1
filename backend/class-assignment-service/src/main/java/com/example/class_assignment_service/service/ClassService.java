package com.example.class_assignment_service.service;

import com.example.class_assignment_service.dto.request.CreateClassRequest;
import com.example.class_assignment_service.dto.request.UpdateClassRequest;
import com.example.class_assignment_service.dto.response.ClassResponse;
import com.example.class_assignment_service.model.ClassEntity;
import com.example.class_assignment_service.model.ClassMember;
import com.example.class_assignment_service.model.enums.ClassRole;
import com.example.class_assignment_service.repository.ClassMemberRepository;
import com.example.class_assignment_service.repository.ClassRepository;
import com.example.class_assignment_service.exception.AppException;
import com.example.class_assignment_service.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClassService {
    
    private final ClassRepository classRepository;
    private final ClassMemberRepository classMemberRepository;
    private final PermissionService permissionService;
    
    @Transactional
    public ClassResponse createClass(CreateClassRequest request, Long userId) {
        ClassEntity classEntity = ClassEntity.builder()
            .name(request.getName())
            .description(request.getDescription())
            .topic(request.getSubject())
            .status("ACTIVE")
            .teacherId(userId)
            .invitationCode(generateInvitationCode())
            .build();
        
        classEntity = classRepository.save(classEntity);
        
        // Add creator as teacher
        ClassMember teacher = ClassMember.builder()
            .classEntity(classEntity)
            .userId(userId)
            .role(ClassRole.TEACHER)
            .joinedAt(java.time.LocalDateTime.now())
            .build();
        classMemberRepository.save(teacher);
        
        log.info("Class created: {} by user: {}", classEntity.getId(), userId);
        return toResponse(classEntity);
    }
    
    @Transactional
    public ClassResponse updateClass(Long classId, UpdateClassRequest request, Long userId) {
        ClassEntity classEntity = getClassById(classId);
        permissionService.checkTeacherOrTA(classId, userId);
        
        if (request.getName() != null) {
            classEntity.setName(request.getName());
        }
        if (request.getDescription() != null) {
            classEntity.setDescription(request.getDescription());
        }
        if (request.getSubject() != null) {
            classEntity.setTopic(request.getSubject());
        }
        if (request.getStatus() != null) {
            classEntity.setStatus(request.getStatus().name());
        } else {
            classEntity.setStatus("ACTIVE");
        }
        
        classEntity = classRepository.save(classEntity);
        log.info("Class updated: {} by user: {}", classId, userId);
        return toResponse(classEntity);
    }
    
    public ClassResponse getClassById(Long classId, Long userId) {
        ClassEntity classEntity = getClassById(classId);
        permissionService.checkMemberAccess(classId, userId);
        return toResponse(classEntity);
    }
    
    public List<ClassResponse> getClassesByUser(Long userId, String role) {
        log.info("Getting classes for user: {}, role: {}", userId, role);
        
        List<ClassEntity> classes;
        if (role != null && !role.isEmpty()) {
            // Convert String to ClassRole enum
            ClassRole roleEnum;
            try {
                roleEnum = ClassRole.valueOf(role.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.error("Invalid role: {}", role);
                throw new AppException(ErrorCode.INVALID_ROLE, "Invalid role: " + role);
            }
            classes = classRepository.findByUserIdAndRole(userId, roleEnum);
            log.info("Found {} classes with role filter: {}", classes.size(), role);
        } else {
            // Get classes where user is teacher (by teacher_id column)
            List<ClassEntity> teacherClasses = classRepository.findByTeacherId(userId);
            log.info("Found {} classes where user is teacher (teacher_id={})", teacherClasses.size(), userId);
            if (!teacherClasses.isEmpty()) {
                log.info("Teacher class IDs: {}", teacherClasses.stream().map(ClassEntity::getId).collect(Collectors.toList()));
            }
            
            // Get classes where user is a member (in class_members table)
            List<ClassEntity> memberClasses = classRepository.findByUserId(userId);
            log.info("Found {} classes where user is a member", memberClasses.size());
            if (!memberClasses.isEmpty()) {
                log.info("Member class IDs: {}", memberClasses.stream().map(ClassEntity::getId).collect(Collectors.toList()));
            }
            
            // Merge and remove duplicates by ID
            java.util.Set<Long> allClassIds = new java.util.HashSet<>();
            classes = new java.util.ArrayList<>();
            
            // Add teacher classes
            for (ClassEntity c : teacherClasses) {
                if (allClassIds.add(c.getId())) {
                    classes.add(c);
                    log.info("Added teacher class: id={}, name={}", c.getId(), c.getName());
                }
            }
            
            // Add member classes (skip if already added as teacher)
            for (ClassEntity c : memberClasses) {
                if (allClassIds.add(c.getId())) {
                    classes.add(c);
                    log.info("Added member class: id={}, name={}", c.getId(), c.getName());
                }
            }
            
            log.info("Total unique classes: {}", classes.size());
        }
        
        return classes.stream().map(this::toResponse).collect(Collectors.toList());
    }
    
    @Transactional
    public void deleteClass(Long classId, Long userId) {
        ClassEntity classEntity = getClassById(classId);
        permissionService.checkTeacher(classId, userId);
        classRepository.delete(classEntity);
        log.info("Class deleted: {} by user: {}", classId, userId);
    }
    
    @Transactional
    public ClassResponse regenerateInvitationCode(Long classId, Long userId) {
        ClassEntity classEntity = getClassById(classId);
        permissionService.checkTeacherOrTA(classId, userId);
        
        classEntity.setInvitationCode(generateInvitationCode());
        classEntity = classRepository.save(classEntity);
        
        log.info("Invitation code regenerated for class: {} by user: {}", classId, userId);
        return toResponse(classEntity);
    }
    
    @Transactional
    public ClassResponse joinClassByInvitationCode(String invitationCode, Long userId) {
        ClassEntity classEntity = classRepository.findByInvitationCode(invitationCode)
            .orElseThrow(() -> new AppException(ErrorCode.INVITATION_CODE_INVALID));
        
        if (classMemberRepository.existsByClassEntityIdAndUserId(classEntity.getId(), userId)) {
            throw new AppException(ErrorCode.MEMBER_ALREADY_EXISTS);
        }
        
        ClassMember member = ClassMember.builder()
            .classEntity(classEntity)
            .userId(userId)
            .role(ClassRole.STUDENT)
            .joinedAt(java.time.LocalDateTime.now())
            .build();
        classMemberRepository.save(member);
        
        log.info("User {} joined class {} via invitation code", userId, classEntity.getId());
        return toResponse(classEntity);
    }
    
    private ClassEntity getClassById(Long classId) {
        return classRepository.findById(classId)
            .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_FOUND));
    }
    
    private String generateInvitationCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    private ClassResponse toResponse(ClassEntity classEntity) {
        Integer memberCount = classMemberRepository.countByClassIdAndRole(classEntity.getId(), ClassRole.STUDENT).intValue() +
            classMemberRepository.countByClassIdAndRole(classEntity.getId(), ClassRole.TEACHER).intValue();
        
        return ClassResponse.builder()
            .id(classEntity.getId())
            .name(classEntity.getName())
            .description(classEntity.getDescription())
            .subject(classEntity.getTopic())
            .status(classEntity.getStatus() != null ? 
                com.example.class_assignment_service.model.enums.ClassStatus.valueOf(classEntity.getStatus()) : 
                com.example.class_assignment_service.model.enums.ClassStatus.ACTIVE)
            .invitationCode(classEntity.getInvitationCode())
            .invitationLink("/join/" + classEntity.getInvitationCode())
            .createdBy(classEntity.getTeacherId())
            .createdAt(classEntity.getCreatedAt())
            .updatedAt(classEntity.getUpdatedAt())
            .memberCount(memberCount)
            .assignmentCount(classEntity.getAssignments() != null ? classEntity.getAssignments().size() : 0)
            .build();
    }
}
