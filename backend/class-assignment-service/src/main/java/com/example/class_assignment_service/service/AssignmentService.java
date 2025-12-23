package com.example.class_assignment_service.service;

import com.example.class_assignment_service.client.NotificationServiceClient;
import com.example.class_assignment_service.client.QuizServiceClient;
import com.example.class_assignment_service.dto.request.CreateAssignmentRequest;
import com.example.class_assignment_service.dto.response.AssignmentResponse;
import com.example.class_assignment_service.model.Assignment;
import com.example.class_assignment_service.model.StudentProgress;
import com.example.class_assignment_service.model.ClassEntity;
import com.example.class_assignment_service.model.ClassMember;
import com.example.class_assignment_service.model.enums.ClassRole;
import com.example.class_assignment_service.repository.AssignmentRepository;
import com.example.class_assignment_service.repository.StudentProgressRepository;
import com.example.class_assignment_service.repository.ClassMemberRepository;
import com.example.class_assignment_service.repository.ClassRepository;
import com.example.class_assignment_service.exception.AppException;
import com.example.class_assignment_service.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AssignmentService {
    
    private final AssignmentRepository assignmentRepository;
    private final StudentProgressRepository progressRepository;
    private final ClassRepository classRepository;
    private final ClassMemberRepository classMemberRepository;
    private final PermissionService permissionService;
    private final QuizServiceClient quizServiceClient;
    private final NotificationServiceClient notificationServiceClient;
    
    @Transactional
    public AssignmentResponse createAssignment(CreateAssignmentRequest request, Long userId) {
        ClassEntity classEntity = classRepository.findById(request.getClassId())
            .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_FOUND));
        
        permissionService.checkTeacherOrTA(request.getClassId(), userId);
        
        // Verify quiz exists if provided
        if (request.getQuizId() != null) {
            quizServiceClient.getQuizInfo(request.getQuizId());
        }
        
        Assignment assignment = Assignment.builder()
            .classEntity(classEntity)
            .quizId(request.getQuizId())
            .title(request.getTitle())
            .description(request.getDescription())
            .startTime(request.getOpenTime() != null ? request.getOpenTime() : LocalDateTime.now())
            .dueTime(request.getDeadline())
            .allowMultipleAttempts(request.getAllowRetake() != null ? request.getAllowRetake() : false)
            .maxScore(request.getMaxAttempts() != null ? request.getMaxAttempts().intValue() : null)
            .build();
        
        assignment = assignmentRepository.save(assignment);
        
        // Notify all students
        notifyStudentsAboutNewAssignment(classEntity.getId(), assignment);
        
        log.info("Assignment created: {} in class: {} by user: {}", assignment.getId(), request.getClassId(), userId);
        return toResponse(assignment, userId);
    }
    
    public List<AssignmentResponse> getAssignmentsByClass(Long classId, Long userId) {
        permissionService.checkMemberAccess(classId, userId);
        List<Assignment> assignments = assignmentRepository.findByClassEntityId(classId);
        return assignments.stream()
            .map(a -> toResponse(a, userId))
            .collect(Collectors.toList());
    }
    
    public AssignmentResponse getAssignmentById(Long assignmentId, Long userId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new AppException(ErrorCode.ASSIGNMENT_NOT_FOUND));
        
        permissionService.checkMemberAccess(assignment.getClassEntity().getId(), userId);
        return toResponse(assignment, userId);
    }
    
    @Transactional
    public StudentProgress startAssignment(Long assignmentId, Long userId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new AppException(ErrorCode.ASSIGNMENT_NOT_FOUND));
        
        permissionService.checkMemberAccess(assignment.getClassEntity().getId(), userId);
        
        // Check if assignment is open
        if (LocalDateTime.now().isBefore(assignment.getStartTime())) {
            throw new AppException(ErrorCode.ASSIGNMENT_NOT_OPEN);
        }
        
        if (LocalDateTime.now().isAfter(assignment.getDueTime())) {
            throw new AppException(ErrorCode.ASSIGNMENT_CLOSED);
        }
        
        // Get or create progress
        StudentProgress progress = progressRepository
            .findByAssignmentIdAndStudentId(assignmentId, userId)
            .orElse(StudentProgress.builder()
                .assignment(assignment)
                .studentId(userId)
                .status("IN_PROGRESS")
                .lastUpdated(LocalDateTime.now())
                .build());
        
        progress.setStatus("IN_PROGRESS");
        progress.setLastUpdated(LocalDateTime.now());
        progress = progressRepository.save(progress);
        
        log.info("Assignment started: {} by user: {}", assignmentId, userId);
        return progress;
    }
    
    @Transactional
    public void syncProgressScore(Long progressId, Long attemptId, Integer score) {
        StudentProgress progress = progressRepository.findById(progressId)
            .orElseThrow(() -> new AppException(ErrorCode.ASSIGNMENT_NOT_FOUND));
        
        progress.setAttemptId(attemptId);
        progress.setScore(score);
        progress.setStatus("SUBMITTED");
        progress.setLastUpdated(LocalDateTime.now());
        
        progressRepository.save(progress);
        
        log.info("Progress score synced: {} with score {}", progressId, score);
    }
    
    @Transactional
    public void deleteAssignment(Long assignmentId, Long userId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new AppException(ErrorCode.ASSIGNMENT_NOT_FOUND));
        
        permissionService.checkTeacherOrTA(assignment.getClassEntity().getId(), userId);
        
        // Delete all related student progress
        List<StudentProgress> progressList = progressRepository.findByAssignmentId(assignmentId);
        progressRepository.deleteAll(progressList);
        
        // Delete the assignment
        assignmentRepository.delete(assignment);
        
        log.info("Assignment deleted: {} by user: {}", assignmentId, userId);
    }
    
    private void notifyStudentsAboutNewAssignment(Long classId, Assignment assignment) {
        List<ClassMember> students = classMemberRepository.findByClassEntityIdAndRole(classId, ClassRole.STUDENT);
        
        students.forEach(student -> {
            notificationServiceClient.sendAssignmentNotification(
                student.getUserId(),
                null,
                assignment.getTitle(),
                assignment.getClassEntity().getName(),
                assignment.getDueTime()
            );
        });
    }
    
    private AssignmentResponse toResponse(Assignment assignment, Long userId) {
        String userStatus = "NOT_STARTED";
        Integer userAttemptCount = 0;
        
        if (userId != null) {
            StudentProgress progress = progressRepository
                .findByAssignmentIdAndStudentId(assignment.getId(), userId)
                .orElse(null);
            
            if (progress != null) {
                userStatus = progress.getStatus();
                userAttemptCount = progress.getAttemptId() != null ? 1 : 0;
            } else {
                // Check if overdue
                if (LocalDateTime.now().isAfter(assignment.getDueTime())) {
                    userStatus = "OVERDUE";
                }
            }
        }
        
        return AssignmentResponse.builder()
            .id(assignment.getId())
            .classId(assignment.getClassEntity().getId())
            .className(assignment.getClassEntity().getName())
            .quizId(assignment.getQuizId())
            .title(assignment.getTitle())
            .description(assignment.getDescription())
            .openTime(assignment.getStartTime())
            .closeTime(assignment.getDueTime())
            .deadline(assignment.getDueTime())
            .maxAttempts(assignment.getMaxScore() != null ? assignment.getMaxScore() : 1)
            .allowRetake(assignment.getAllowMultipleAttempts())
            .createdBy(assignment.getClassEntity().getTeacherId())
            .createdAt(assignment.getCreatedAt())
            .updatedAt(assignment.getUpdatedAt())
            .userStatus(convertStatus(userStatus))
            .userAttemptCount(userAttemptCount)
            .build();
    }
    
    private com.example.class_assignment_service.model.enums.AssignmentStatus convertStatus(String status) {
        try {
            return com.example.class_assignment_service.model.enums.AssignmentStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            return com.example.class_assignment_service.model.enums.AssignmentStatus.NOT_STARTED;
        }
    }
}
