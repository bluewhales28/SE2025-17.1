package com.example.class_assignment_service.controller;

import com.example.class_assignment_service.dto.request.AcceptInvitationRequest;
import com.example.class_assignment_service.dto.response.ApiResponse;
import com.example.class_assignment_service.dto.response.ClassResponse;
import com.example.class_assignment_service.service.InvitationService;
import com.example.class_assignment_service.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
public class InvitationController {
    
    private final InvitationService invitationService;
    
    @PostMapping("/accept")
    public ResponseEntity<ApiResponse<ClassResponse>> acceptInvitation(
            @Valid @RequestBody AcceptInvitationRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        ClassResponse response = invitationService.acceptInvitation(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Invitation accepted", response));
    }
}

