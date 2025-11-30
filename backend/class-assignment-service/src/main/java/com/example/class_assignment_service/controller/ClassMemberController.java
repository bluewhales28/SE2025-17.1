package com.example.class_assignment_service.controller;

import com.example.class_assignment_service.dto.request.AddMemberRequest;
import com.example.class_assignment_service.dto.request.UpdateMemberRoleRequest;
import com.example.class_assignment_service.dto.response.ApiResponse;
import com.example.class_assignment_service.dto.response.ClassMemberResponse;
import com.example.class_assignment_service.service.ClassMemberService;
import com.example.class_assignment_service.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes/{classId}/members")
@RequiredArgsConstructor
public class ClassMemberController {
    
    private final ClassMemberService classMemberService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<ClassMemberResponse>> addMember(
            @PathVariable Long classId,
            @Valid @RequestBody AddMemberRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        ClassMemberResponse response = classMemberService.addMember(classId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Member added successfully", response));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<ClassMemberResponse>>> getMembers(@PathVariable Long classId) {
        Long userId = SecurityUtil.getCurrentUserId();
        List<ClassMemberResponse> responses = classMemberService.getClassMembers(classId, userId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
    
    @PutMapping("/{memberId}/role")
    public ResponseEntity<ApiResponse<ClassMemberResponse>> updateMemberRole(
            @PathVariable Long classId,
            @PathVariable Long memberId,
            @Valid @RequestBody UpdateMemberRoleRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        ClassMemberResponse response = classMemberService.updateMemberRole(classId, memberId, request, userId);
        return ResponseEntity.ok(ApiResponse.success("Member role updated", response));
    }
    
    @DeleteMapping("/{memberId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable Long classId,
            @PathVariable Long memberId) {
        Long userId = SecurityUtil.getCurrentUserId();
        classMemberService.removeMember(classId, memberId, userId);
        return ResponseEntity.ok(ApiResponse.success("Member removed successfully", null));
    }
}

