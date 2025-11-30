package com.example.class_assignment_service.scheduler;

import com.example.class_assignment_service.client.NotificationServiceClient;
import com.example.class_assignment_service.model.Assignment;
import com.example.class_assignment_service.model.ClassMember;
import com.example.class_assignment_service.model.StudentProgress;
import com.example.class_assignment_service.model.enums.ClassRole;
import com.example.class_assignment_service.repository.AssignmentRepository;
import com.example.class_assignment_service.repository.StudentProgressRepository;
import com.example.class_assignment_service.repository.ClassMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DeadlineReminderScheduler {
    
    private final AssignmentRepository assignmentRepository;
    private final StudentProgressRepository progressRepository;
    private final ClassMemberRepository classMemberRepository;
    private final NotificationServiceClient notificationServiceClient;
    
    @Scheduled(cron = "0 0 9 * * *") // Run daily at 9 AM
    public void sendDeadlineReminders() {
        log.info("Running deadline reminder job");
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrow = now.plusDays(1);
        
        // Find assignments with deadlines in the next 24 hours
        List<Assignment> assignments = assignmentRepository.findAll()
            .stream()
            .filter(a -> a.getDueTime() != null 
                && a.getDueTime().isAfter(now) 
                && a.getDueTime().isBefore(tomorrow))
            .toList();
        
        for (Assignment assignment : assignments) {
            List<ClassMember> students = classMemberRepository
                .findByClassEntityIdAndRole(assignment.getClassEntity().getId(), ClassRole.STUDENT);
            
            for (ClassMember student : students) {
                // Check if student hasn't submitted
                StudentProgress progress = progressRepository
                    .findByAssignmentIdAndStudentId(assignment.getId(), student.getUserId())
                    .orElse(null);
                
                boolean hasSubmitted = progress != null && progress.getStatus().equals("SUBMITTED");
                
                if (!hasSubmitted) {
                    notificationServiceClient.sendDeadlineReminder(
                        student.getUserId(),
                        null, // Email would come from user service
                        assignment.getTitle(),
                        assignment.getClassEntity().getName(),
                        assignment.getDueTime()
                    );
                }
            }
        }
        
        log.info("Deadline reminder job completed. Processed {} assignments", assignments.size());
    }
}

