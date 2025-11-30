package com.quizapp.user_auth_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizapp.user_auth_service.dto.response.ApiResponse;
import com.quizapp.user_auth_service.exception.ErrorCode;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import java.io.IOException;

@Slf4j
public class CustomJwtAuthentited implements AuthenticationEntryPoint{
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
        ErrorCode errorCode = ErrorCode.UNAUTHENTICATED;

        // Debug log to trace 401 root cause
        String authHeader = request.getHeader("Authorization");
        String authPreview = authHeader == null ? "<none>" : authHeader.substring(0, Math.min(authHeader.length(), 20));
        log.warn("401 Unauthenticated at uri={}, Authorization present={}, preview='{}'", request.getRequestURI(), authHeader != null, authPreview);

        response.setStatus(errorCode.getHttpStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ApiResponse<?> apiResponse = ApiResponse.builder()
                .status(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();

        objectMapper.writeValue(response.getOutputStream(), apiResponse);
    }
}
