package com.quizapp.user_auth_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizapp.user_auth_service.dto.response.ApiResponse;
import com.quizapp.user_auth_service.exception.ErrorCode;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

import java.io.IOException;

public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException, ServletException {


        ErrorCode errorCode = ErrorCode.UNAUTHENTICATED;

        // Thiết lập mã trạng thái HTTP (401)
        response.setStatus(errorCode.getHttpStatus().value());

        // Thiết lập kiểu nội dung
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        // Tạo phản hồi API với thông báo "You do not have permission"
        ApiResponse<?> apiResponse = ApiResponse.builder()
                .status(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();

        // Ghi phản hồi vào response
        objectMapper.writeValue(response.getOutputStream(), apiResponse);
    }
}