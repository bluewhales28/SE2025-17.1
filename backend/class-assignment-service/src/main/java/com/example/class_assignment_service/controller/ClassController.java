package com.example.class_assignment_service.controller;

import com.example.class_assignment_service.dto.request.CreateClassRequest;
import com.example.class_assignment_service.dto.request.UpdateClassRequest;
import com.example.class_assignment_service.dto.response.ApiResponse;
import com.example.class_assignment_service.dto.response.ClassResponse;
import com.example.class_assignment_service.exception.AppException;
import com.example.class_assignment_service.exception.ErrorCode;
import com.example.class_assignment_service.service.ClassService;
import com.example.class_assignment_service.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClassController {
    
    private final ClassService classService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<ClassResponse>> createClass(
            @Valid @RequestBody CreateClassRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "User not authenticated or invalid token");
        }
        
        // Check if user has permission to create class (USER or ADMIN)
        // If user is authenticated (has userId), allow creation
        // Role check is handled by SecurityConfig - if authenticated, user can create
        
        ClassResponse response = classService.createClass(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Class created successfully", response));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ClassResponse>> updateClass(
            @PathVariable Long id,
            @Valid @RequestBody UpdateClassRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "User not authenticated or invalid token");
        }
        ClassResponse response = classService.updateClass(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success("Class updated successfully", response));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClassResponse>> getClass(@PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "User not authenticated or invalid token");
        }
        ClassResponse response = classService.getClassById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<ClassResponse>>> getClasses(
            @RequestParam(required = false) String role) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "User not authenticated or invalid token");
        }
        List<ClassResponse> responses = classService.getClassesByUser(userId, role);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteClass(@PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "User not authenticated or invalid token");
        }
        classService.deleteClass(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Class deleted successfully", null));
    }
    
    @PostMapping("/{id}/regenerate-invitation")
    public ResponseEntity<ApiResponse<ClassResponse>> regenerateInvitationCode(@PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "User not authenticated or invalid token");
        }
        ClassResponse response = classService.regenerateInvitationCode(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Invitation code regenerated", response));
    }
    
    @PostMapping("/join")
    public ResponseEntity<ApiResponse<ClassResponse>> joinClassByInvitationCode(
            @RequestParam String invitationCode) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "User not authenticated or invalid token");
        }
        ClassResponse response = classService.joinClassByInvitationCode(invitationCode, userId);
        return ResponseEntity.ok(ApiResponse.success("Joined class successfully", response));
    }
}

