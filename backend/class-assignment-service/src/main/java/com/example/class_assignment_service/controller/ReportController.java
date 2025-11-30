package com.example.class_assignment_service.controller;

import com.example.class_assignment_service.dto.response.ApiResponse;
import com.example.class_assignment_service.dto.response.ClassReportResponse;
import com.example.class_assignment_service.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    
    private final ReportService reportService;
    
    @GetMapping("/class/{classId}")
    public ResponseEntity<ApiResponse<ClassReportResponse>> getClassReport(@PathVariable Long classId) {
        Long userId = com.example.class_assignment_service.util.SecurityUtil.getCurrentUserId();
        ClassReportResponse response = reportService.getClassReport(classId, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

