package com.quizapp.user_auth_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizapp.user_auth_service.dto.response.ApiResponse;
import com.quizapp.user_auth_service.exception.ErrorCode;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import java.io.IOException;

public class CustomJwtAuthentited implements AuthenticationEntryPoint{
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
        ErrorCode errorCode = ErrorCode.UNAUTHENTICATED;

        response.setStatus(errorCode.getHttpStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ApiResponse<?> apiResponse = ApiResponse.builder()
                .status(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();

        objectMapper.writeValue(response.getOutputStream(), apiResponse);
    }
}
