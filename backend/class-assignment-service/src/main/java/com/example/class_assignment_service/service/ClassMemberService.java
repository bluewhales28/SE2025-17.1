package com.example.class_assignment_service.service;

import com.example.class_assignment_service.dto.request.AddMemberRequest;
import com.example.class_assignment_service.dto.request.UpdateMemberRoleRequest;
import com.example.class_assignment_service.dto.response.ClassMemberResponse;
import com.example.class_assignment_service.model.ClassEntity;
import com.example.class_assignment_service.model.ClassMember;
import com.example.class_assignment_service.model.enums.ClassRole;
import com.example.class_assignment_service.repository.ClassMemberRepository;
import com.example.class_assignment_service.repository.ClassRepository;
import com.example.class_assignment_service.exception.AppException;
import com.example.class_assignment_service.exception.ErrorCode;
import com.example.class_assignment_service.client.UserServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClassMemberService {
    
    private final ClassMemberRepository classMemberRepository;
    private final ClassRepository classRepository;
    private final PermissionService permissionService;
    private final UserServiceClient userServiceClient;
    
    @Transactional
    public ClassMemberResponse addMember(Long classId, AddMemberRequest request, Long userId) {
        ClassEntity classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_FOUND));
        
        permissionService.checkTeacherOrTA(classId, userId);
        
        if (classMemberRepository.existsByClassEntityIdAndUserId(classId, request.getUserId())) {
            throw new AppException(ErrorCode.MEMBER_ALREADY_EXISTS);
        }
        
        ClassMember member = ClassMember.builder()
            .classEntity(classEntity)
            .userId(request.getUserId())
            .role(ClassRole.valueOf(request.getRole().name()))
            .joinedAt(java.time.LocalDateTime.now())
            .build();
        
        member = classMemberRepository.save(member);
        log.info("Member added to class {}: user {} with role {}", classId, request.getUserId(), request.getRole());
        return toResponse(member);
    }
    
    public List<ClassMemberResponse> getClassMembers(Long classId, Long userId) {
        permissionService.checkMemberAccess(classId, userId);
        List<ClassMember> members = classMemberRepository.findByClassEntityId(classId);
        return members.stream().map(this::toResponse).collect(Collectors.toList());
    }
    
    @Transactional
    public ClassMemberResponse updateMemberRole(Long classId, Long memberId, UpdateMemberRoleRequest request, Long userId) {
        permissionService.checkTeacher(classId, userId);
        
        ClassMember member = classMemberRepository.findById(memberId)
            .orElseThrow(() -> new AppException(ErrorCode.MEMBER_NOT_FOUND));
        
        if (!member.getClassEntity().getId().equals(classId)) {
            throw new AppException(ErrorCode.MEMBER_NOT_FOUND);
        }
        
        // Prevent removing last teacher
        ClassRole newRole = ClassRole.valueOf(request.getRole().name());
        if (member.getRole() == ClassRole.TEACHER && newRole != ClassRole.TEACHER) {
            long teacherCount = classMemberRepository.countByClassIdAndRole(classId, ClassRole.TEACHER);
            if (teacherCount <= 1) {
                throw new AppException(ErrorCode.CANNOT_REMOVE_LAST_TEACHER);
            }
        }
        
        member.setRole(newRole);
        member = classMemberRepository.save(member);
        log.info("Member role updated: {} in class {} by user {}", memberId, classId, userId);
        return toResponse(member);
    }
    
    @Transactional
    public void removeMember(Long classId, Long memberId, Long userId) {
        permissionService.checkTeacherOrTA(classId, userId);
        
        ClassMember member = classMemberRepository.findById(memberId)
            .orElseThrow(() -> new AppException(ErrorCode.MEMBER_NOT_FOUND));
        
        if (!member.getClassEntity().getId().equals(classId)) {
            throw new AppException(ErrorCode.MEMBER_NOT_FOUND);
        }
        
        // Prevent removing last teacher
        if (member.getRole() == ClassRole.TEACHER) {
            long teacherCount = classMemberRepository.countByClassIdAndRole(classId, ClassRole.TEACHER);
            if (teacherCount <= 1) {
                throw new AppException(ErrorCode.CANNOT_REMOVE_LAST_TEACHER);
            }
        }
        
        classMemberRepository.delete(member);
        log.info("Member removed: {} from class {} by user {}", memberId, classId, userId);
    }
    
    private ClassMemberResponse toResponse(ClassMember member) {
        String userName = userServiceClient.getUserNameById(member.getUserId());
        return ClassMemberResponse.builder()
            .id(member.getId())
            .classId(member.getClassEntity().getId())
            .className(member.getClassEntity().getName())
            .userId(member.getUserId())
            .userName(userName)
            .role(com.example.class_assignment_service.model.enums.MemberRole.valueOf(member.getRole().name()))
            .joinedAt(member.getJoinedAt())
            .isActive(true)
            .isBlocked(false)
            .build();
    }
}
