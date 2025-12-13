package com.example.class_assignment_service.service;

import com.example.class_assignment_service.model.ClassMember;
import com.example.class_assignment_service.model.enums.ClassRole;
import com.example.class_assignment_service.repository.ClassMemberRepository;
import com.example.class_assignment_service.exception.AppException;
import com.example.class_assignment_service.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PermissionService {
    
    private final ClassMemberRepository classMemberRepository;
    
    public void checkTeacher(Long classId, Long userId) {
        ClassMember member = getMember(classId, userId);
        if (member.getRole() != ClassRole.TEACHER) {
            throw new AppException(ErrorCode.FORBIDDEN, "Only teachers can perform this action");
        }
    }
    
    public void checkTeacherOrTA(Long classId, Long userId) {
        // Deprecated: Only teachers can perform this action now (no TA role)
        checkTeacher(classId, userId);
    }
    
    public void checkMemberAccess(Long classId, Long userId) {
        getMember(classId, userId);
    }
    
    public ClassMember getMember(Long classId, Long userId) {
        Optional<ClassMember> memberOpt = classMemberRepository.findByClassEntityIdAndUserId(classId, userId);
        if (memberOpt.isEmpty()) {
            throw new AppException(ErrorCode.UNAUTHORIZED_CLASS_ACCESS);
        }
        return memberOpt.get();
    }
    
    public ClassRole getMemberRole(Long classId, Long userId) {
        return getMember(classId, userId).getRole();
    }
}
