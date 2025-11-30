package com.example.class_assignment_service.service;

import com.example.class_assignment_service.dto.response.AssignmentReportResponse;
import com.example.class_assignment_service.dto.response.ClassReportResponse;
import com.example.class_assignment_service.dto.response.StudentProgressResponse;
import com.example.class_assignment_service.model.Assignment;
import com.example.class_assignment_service.model.StudentProgress;
import com.example.class_assignment_service.model.ClassEntity;
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

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {
    
    private final ClassRepository classRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentProgressRepository progressRepository;
    private final ClassMemberRepository classMemberRepository;
    private final PermissionService permissionService;
    
    public ClassReportResponse getClassReport(Long classId, Long userId) {
        ClassEntity classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_FOUND));
        
        permissionService.checkTeacherOrTA(classId, userId);
        
        List<Assignment> assignments = assignmentRepository.findByClassEntityId(classId);
        List<Long> studentIds = classMemberRepository
            .findByClassEntityIdAndRole(classId, ClassRole.STUDENT)
            .stream()
            .map(member -> member.getUserId())
            .collect(Collectors.toList());
        
        List<AssignmentReportResponse> assignmentReports = assignments.stream()
            .map(this::generateAssignmentReport)
            .collect(Collectors.toList());
        
        List<StudentProgressResponse> studentProgress = studentIds.stream()
            .map(studentId -> generateStudentProgress(classId, studentId, assignments))
            .collect(Collectors.toList());
        
        double averageScore = studentProgress.stream()
            .filter(sp -> sp.getAverageScore() != null && sp.getAverageScore() > 0)
            .mapToDouble(StudentProgressResponse::getAverageScore)
            .average()
            .orElse(0.0);
        
        return ClassReportResponse.builder()
            .classId(classId)
            .className(classEntity.getName())
            .totalStudents(studentIds.size())
            .totalAssignments(assignments.size())
            .averageScore(averageScore)
            .assignmentReports(assignmentReports)
            .studentProgress(studentProgress)
            .build();
    }
    
    private AssignmentReportResponse generateAssignmentReport(Assignment assignment) {
        List<StudentProgress> progresses = progressRepository.findByAssignmentId(assignment.getId());
        
        List<StudentProgress> completed = progresses.stream()
            .filter(p -> p.getStatus().equals("SUBMITTED") && p.getScore() != null)
            .collect(Collectors.toList());
        
        double averageScore = completed.stream()
            .mapToDouble(p -> p.getScore().doubleValue())
            .average()
            .orElse(0.0);
        
        double maxScore = completed.stream()
            .mapToDouble(p -> p.getScore().doubleValue())
            .max()
            .orElse(0.0);
        
        double minScore = completed.stream()
            .mapToDouble(p -> p.getScore().doubleValue())
            .min()
            .orElse(0.0);
        
        long uniqueStudents = progresses.stream()
            .map(StudentProgress::getStudentId)
            .distinct()
            .count();
        
        long totalStudents = classMemberRepository
            .countByClassIdAndRole(assignment.getClassEntity().getId(), ClassRole.STUDENT);
        
        double completionRate = totalStudents > 0 ? (double) uniqueStudents / totalStudents * 100 : 0.0;
        
        return AssignmentReportResponse.builder()
            .assignmentId(assignment.getId())
            .assignmentTitle(assignment.getTitle())
            .deadline(assignment.getDueTime())
            .totalSubmissions(completed.size())
            .totalStudents((int) totalStudents)
            .averageScore(averageScore)
            .maxScore(maxScore)
            .minScore(minScore)
            .completionRate(completionRate)
            .build();
    }
    
    private StudentProgressResponse generateStudentProgress(Long classId, Long studentId, List<Assignment> assignments) {
        int completedCount = 0;
        double totalScore = 0.0;
        
        for (Assignment assignment : assignments) {
            StudentProgress progress = progressRepository
                .findByAssignmentIdAndStudentId(assignment.getId(), studentId)
                .orElse(null);
            
            if (progress != null && progress.getStatus().equals("SUBMITTED") && progress.getScore() != null) {
                totalScore += progress.getScore();
                completedCount++;
            }
        }
        
        double averageScore = completedCount > 0 ? totalScore / completedCount : 0.0;
        double completionRate = assignments.size() > 0 ? (double) completedCount / assignments.size() * 100 : 0.0;
        
        return StudentProgressResponse.builder()
            .userId(studentId)
            .completedAssignments(completedCount)
            .totalAssignments(assignments.size())
            .averageScore(averageScore)
            .totalScore(totalScore)
            .completionRate(completionRate)
            .build();
    }
}
