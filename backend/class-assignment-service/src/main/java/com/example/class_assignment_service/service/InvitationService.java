package com.example.class_assignment_service.service;

import com.example.class_assignment_service.client.NotificationServiceClient;
import com.example.class_assignment_service.dto.request.AcceptInvitationRequest;
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

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvitationService {
    
    private final ClassRepository classRepository;
    private final ClassMemberRepository classMemberRepository;
    private final NotificationServiceClient notificationServiceClient;
    private final ClassService classService;
    
    @Transactional
    public ClassResponse acceptInvitation(AcceptInvitationRequest request, Long userId) {
        ClassEntity classEntity = classRepository.findByInvitationCode(request.getInvitationCode())
            .orElseThrow(() -> new AppException(ErrorCode.INVITATION_CODE_INVALID));
        
        // Check if user is already a member
        if (classMemberRepository.existsByClassEntityIdAndUserId(classEntity.getId(), userId)) {
            throw new AppException(ErrorCode.MEMBER_ALREADY_EXISTS);
        }
        
        // Add user as student
        ClassMember member = ClassMember.builder()
            .classEntity(classEntity)
            .userId(userId)
            .role(ClassRole.STUDENT)
            .joinedAt(LocalDateTime.now())
            .build();
        classMemberRepository.save(member);
        
        log.info("Invitation accepted: {} by user: {}", request.getInvitationCode(), userId);
        return classService.getClassById(classEntity.getId(), userId);
    }
}
