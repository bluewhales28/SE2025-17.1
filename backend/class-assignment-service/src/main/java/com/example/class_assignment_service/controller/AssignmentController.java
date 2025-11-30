package com.example.class_assignment_service.controller;

import com.example.class_assignment_service.dto.request.CreateAssignmentRequest;
import com.example.class_assignment_service.dto.response.ApiResponse;
import com.example.class_assignment_service.dto.response.AssignmentResponse;
import com.example.class_assignment_service.service.AssignmentService;
import com.example.class_assignment_service.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {
    
    private final AssignmentService assignmentService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<AssignmentResponse>> createAssignment(
            @Valid @RequestBody CreateAssignmentRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        AssignmentResponse response = assignmentService.createAssignment(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Assignment created successfully", response));
    }
    
    @GetMapping("/class/{classId}")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAssignmentsByClass(
            @PathVariable Long classId) {
        Long userId = SecurityUtil.getCurrentUserId();
        List<AssignmentResponse> responses = assignmentService.getAssignmentsByClass(classId, userId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getAssignment(@PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        AssignmentResponse response = assignmentService.getAssignmentById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping("/{id}/start")
    public ResponseEntity<ApiResponse<Object>> startAssignment(@PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        assignmentService.startAssignment(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Assignment started", null));
    }
}

