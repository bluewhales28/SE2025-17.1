package com.quizapp.user_auth_service.controller;

import com.quizapp.user_auth_service.dto.request.AuthRequest;
import com.quizapp.user_auth_service.dto.request.IntrospectRequest;
import com.quizapp.user_auth_service.dto.request.LogoutRequest;
import com.quizapp.user_auth_service.dto.request.RefreshToken;
import com.quizapp.user_auth_service.dto.response.ApiResponse;
import com.quizapp.user_auth_service.dto.response.AuthResponse;
import com.quizapp.user_auth_service.dto.response.IntrospectResponse;
import com.quizapp.user_auth_service.service.impl.AuthenticationServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthenticationController {
    
    private final AuthenticationServiceImpl authenticationService;

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@RequestBody @Valid AuthRequest authRequest) {
        log.info("Login attempt for email: {}", authRequest.getEmail());
        
        AuthResponse authResponse = authenticationService.authenticateUser(authRequest);
        
        return ApiResponse.<AuthResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Login successful")
                .data(authResponse)
                .build();
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestBody @Valid LogoutRequest logoutRequest) {
        log.info("Logout request received");
        
        authenticationService.logOut(logoutRequest);
        
        return ApiResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message("Logout successful")
                .build();
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refreshToken(@RequestBody @Valid RefreshToken refreshToken) {
        log.info("Refresh token request received");
        
        try {
            AuthResponse authResponse = authenticationService.refreshToken(refreshToken);
            
            return ApiResponse.<AuthResponse>builder()
                    .status(HttpStatus.OK.value())
                    .message("Token refreshed successfully")
                    .data(authResponse)
                    .build();
        } catch (Exception e) {
            log.error("Token refresh failed", e);
            return ApiResponse.<AuthResponse>builder()
                    .status(HttpStatus.UNAUTHORIZED.value())
                    .message("Token refresh failed")
                    .build();
        }
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspectToken(@RequestBody @Valid IntrospectRequest introspectRequest) {
        log.info("Token introspection request received");
        
        IntrospectResponse introspectResponse = authenticationService.introspectToken(introspectRequest);
        
        return ApiResponse.<IntrospectResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Token introspection completed")
                .data(introspectResponse)
                .build();
    }

}
