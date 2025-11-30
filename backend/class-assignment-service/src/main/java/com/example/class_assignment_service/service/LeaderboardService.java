package com.example.class_assignment_service.service;

import com.example.class_assignment_service.dto.response.LeaderboardEntryResponse;
import com.example.class_assignment_service.dto.response.LeaderboardResponse;
import com.example.class_assignment_service.model.Assignment;
import com.example.class_assignment_service.model.ClassEntity;
import com.example.class_assignment_service.model.StudentProgress;
import com.example.class_assignment_service.model.enums.ClassRole;
import com.example.class_assignment_service.repository.AssignmentRepository;
import com.example.class_assignment_service.repository.ClassMemberRepository;
import com.example.class_assignment_service.repository.ClassRepository;
import com.example.class_assignment_service.repository.StudentProgressRepository;
import com.example.class_assignment_service.exception.AppException;
import com.example.class_assignment_service.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaderboardService {
    
    private final ClassRepository classRepository;
    private final ClassMemberRepository classMemberRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentProgressRepository progressRepository;
    private final PermissionService permissionService;
    
    @Cacheable(value = "leaderboard", key = "#classId")
    public LeaderboardResponse getLeaderboard(Long classId, Long userId) {
        ClassEntity classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_FOUND));
        
        permissionService.checkMemberAccess(classId, userId);
        
        // Get all students
        List<Long> studentIds = classMemberRepository
            .findByClassEntityIdAndRole(classId, ClassRole.STUDENT)
            .stream()
            .map(member -> member.getUserId())
            .collect(Collectors.toList());
        
        // Get all assignments
        List<Assignment> assignments = assignmentRepository.findByClassEntityId(classId);
        
        // Calculate leaderboard entries
        List<LeaderboardEntryResponse> entries = new ArrayList<>();
        int rank = 1;
        
        // Group progress by student
        Map<Long, List<StudentProgress>> progressByStudent = new HashMap<>();
        for (Long studentId : studentIds) {
            List<StudentProgress> progresses = progressRepository
                .findByClassIdAndStudentId(classId, studentId);
            progressByStudent.put(studentId, progresses);
        }
        
        // Calculate scores for each student
        List<LeaderboardEntry> leaderboardEntries = new ArrayList<>();
        for (Long studentId : studentIds) {
            List<StudentProgress> progresses = progressByStudent.getOrDefault(studentId, Collections.emptyList());
            
            double totalScore = 0.0;
            int completedCount = 0;
            
            for (StudentProgress progress : progresses) {
                if (progress.getStatus().equals("SUBMITTED") && progress.getScore() != null) {
                    totalScore += progress.getScore();
                    completedCount++;
                }
            }
            
            double averageScore = completedCount > 0 ? totalScore / completedCount : 0.0;
            
            leaderboardEntries.add(new LeaderboardEntry(
                studentId, totalScore, averageScore, completedCount, assignments.size()
            ));
        }
        
        // Sort by total score descending
        leaderboardEntries.sort((a, b) -> Double.compare(b.totalScore, a.totalScore));
        
        // Build response entries
        for (LeaderboardEntry entry : leaderboardEntries) {
            double completionRate = entry.totalAssignments > 0
                ? (double) entry.completedAssignments / entry.totalAssignments * 100
                : 0.0;
            
            entries.add(LeaderboardEntryResponse.builder()
                .userId(entry.userId)
                .totalScore(entry.totalScore)
                .averageScore(entry.averageScore)
                .completedAssignments(entry.completedAssignments)
                .totalAssignments(entry.totalAssignments)
                .rank(rank++)
                .completionRate(completionRate)
                .build());
        }
        
        return LeaderboardResponse.builder()
            .classId(classId)
            .className(classEntity.getName())
            .entries(entries)
            .totalStudents(entries.size())
            .totalAssignments(assignments.size())
            .build();
    }
    
    private record LeaderboardEntry(Long userId, double totalScore, double averageScore, 
                                    int completedAssignments, int totalAssignments) {}
}
