package com.example.class_assignment_service.controller;

import com.example.class_assignment_service.dto.response.ApiResponse;
import com.example.class_assignment_service.dto.response.LeaderboardResponse;
import com.example.class_assignment_service.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {
    
    private final LeaderboardService leaderboardService;
    
    @GetMapping("/class/{classId}")
    public ResponseEntity<ApiResponse<LeaderboardResponse>> getLeaderboard(@PathVariable Long classId) {
        Long userId = com.example.class_assignment_service.util.SecurityUtil.getCurrentUserId();
        LeaderboardResponse response = leaderboardService.getLeaderboard(classId, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

