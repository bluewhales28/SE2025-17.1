package com.quizapp.user_auth_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizapp.user_auth_service.dto.request.AuthRequest;
import com.quizapp.user_auth_service.dto.request.IntrospectRequest;
import com.quizapp.user_auth_service.dto.request.LogoutRequest;
import com.quizapp.user_auth_service.dto.request.RefreshToken;
import com.quizapp.user_auth_service.dto.response.AuthResponse;
import com.quizapp.user_auth_service.dto.response.IntrospectResponse;
import com.quizapp.user_auth_service.service.impl.AuthenticationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthenticationController.class)
@DisplayName("AuthenticationController Tests")
class AuthenticationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthenticationServiceImpl authenticationService;

    @Autowired
    private ObjectMapper objectMapper;

    private AuthRequest authRequest;
    private AuthResponse authResponse;
    private IntrospectRequest introspectRequest;
    private IntrospectResponse introspectResponse;
    private LogoutRequest logoutRequest;
    private RefreshToken refreshToken;

    @BeforeEach
    void setUp() {
        authRequest = AuthRequest.builder()
                .email("test@example.com")
                .passwordHash("password123")
                .build();

        authResponse = AuthResponse.builder()
                .token("test-token")
                .authenticated(true)
                .build();

        introspectRequest = IntrospectRequest.builder()
                .token("test-token")
                .build();

        introspectResponse = IntrospectResponse.builder()
                .active(true)
                .build();

        logoutRequest = LogoutRequest.builder()
                .token("test-token")
                .build();

        refreshToken = RefreshToken.builder()
                .token("test-token")
                .build();
    }

    @Test
    @DisplayName("Should login successfully")
    void login_Success() throws Exception {
        // Given
        when(authenticationService.authenticateUser(any(AuthRequest.class)))
                .thenReturn(authResponse);

        // When & Then
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.token").value("test-token"))
                .andExpect(jsonPath("$.data.authenticated").value(true));
    }

    @Test
    @DisplayName("Should logout successfully")
    void logout_Success() throws Exception {
        // Given - logOut is a void method, so we don't need to mock its return value

        // When & Then
        mockMvc.perform(post("/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(logoutRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Logout successful"));
    }

    @Test
    @DisplayName("Should refresh token successfully")
    void refreshToken_Success() throws Exception {
        // Given
        when(authenticationService.refreshToken(any(RefreshToken.class)))
                .thenReturn(authResponse);

        // When & Then
        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Token refreshed successfully"))
                .andExpect(jsonPath("$.data.token").value("test-token"));
    }

    @Test
    @DisplayName("Should introspect token successfully")
    void introspectToken_Success() throws Exception {
        // Given
        when(authenticationService.introspectToken(any(IntrospectRequest.class)))
                .thenReturn(introspectResponse);

        // When & Then
        mockMvc.perform(post("/auth/introspect")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(introspectRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Token introspection completed"))
                .andExpect(jsonPath("$.data.active").value(true));
    }

    @Test
    @DisplayName("Should return bad request when login request is invalid")
    void login_InvalidRequest() throws Exception {
        // Given
        AuthRequest invalidRequest = AuthRequest.builder()
                .email("") // Invalid empty email
                .passwordHash("")
                .build();

        // When & Then
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }
}

