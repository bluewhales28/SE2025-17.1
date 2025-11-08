package com.quizapp.user_auth_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizapp.user_auth_service.dto.request.UpdateUserRequest;
import com.quizapp.user_auth_service.dto.request.UserRequest;
import com.quizapp.user_auth_service.dto.response.PageResponse;
import com.quizapp.user_auth_service.dto.response.UserResponse;
import com.quizapp.user_auth_service.service.UserService;
import com.quizapp.user_auth_service.untils.Gender;
import com.quizapp.user_auth_service.untils.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@DisplayName("UserController Tests")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    private UserRequest userRequest;
    private UserResponse userResponse;
    private UpdateUserRequest updateUserRequest;
    private PageResponse<?> pageResponse;

    @BeforeEach
    void setUp() {
        // Setup security context for authenticated requests
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                "test@example.com",
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);

        userRequest = UserRequest.builder()
                .email("newuser@example.com")
                .passwordHash("password123")
                .fullName("New User")
                .phoneNumber("0987654321")
                .dateOfBirth(LocalDate.of(1995, 5, 15))
                .gender(Gender.FEMALE)
                .role(Role.USER)
                .build();

        userResponse = UserResponse.builder()
                .id(1L)
                .fullName("New User")
                .dateOfBirth(LocalDate.of(1995, 5, 15))
                .gender(Gender.FEMALE)
                .role(Role.USER)
                .build();

        updateUserRequest = UpdateUserRequest.builder()
                .fullName("Updated Name")
                .email("updated@example.com")
                .phoneNumber("0111111111")
                .dateOfBirth(LocalDate.of(1992, 3, 20))
                .passwordHash("newPassword123")
                .build();

        List<UserResponse> userList = Collections.singletonList(userResponse);
        pageResponse = PageResponse.<List<UserResponse>>builder()
                .page(0)
                .size(10)
                .total(1L)
                .totalPages(1)
                .hasNext(false)
                .hasPrevious(false)
                .items(userList)
                .build();
    }

    @Test
    @DisplayName("Should create user successfully")
    void createUser_Success() throws Exception {
        // Given
        when(userService.save(any(UserRequest.class))).thenReturn(userResponse);

        // When & Then
        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value(201))
                .andExpect(jsonPath("$.message").value("User created successfully"))
                .andExpect(jsonPath("$.data.fullName").value("New User"));
    }

    @Test
    @DisplayName("Should get user by full name successfully")
    void getUserByFullName_Success() throws Exception {
        // Given
        doReturn(pageResponse).when(userService).findByFullName(anyString(), anyInt(), anyInt());

        // When & Then
        mockMvc.perform(get("/users")
                        .param("fullName", "Test")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Get User by full name successfully"))
                .andExpect(jsonPath("$.data.page").value(0));
    }

    @Test
    @DisplayName("Should get all users successfully")
    void getAllUsers_Success() throws Exception {
        // Given
        doReturn(pageResponse).when(userService).findAll(anyInt(), anyInt(), anyString());

        // When & Then
        mockMvc.perform(get("/users/all")
                        .param("page", "0")
                        .param("size", "10")
                        .param("sortBy", "id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Get all users successfully"));
    }

    @Test
    @DisplayName("Should update user successfully")
    void updateUser_Success() throws Exception {
        // Given - update is a void method, so we don't need to mock its return value

        // When & Then
        mockMvc.perform(put("/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateUserRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Update user successfully"));
    }

    @Test
    @DisplayName("Should get current user profile successfully")
    void getCurrentUserProfile_Success() throws Exception {
        // Given
        when(userService.findByEmail(anyString())).thenReturn(userResponse);

        // When & Then
        mockMvc.perform(get("/users/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Profile retrieved successfully"))
                .andExpect(jsonPath("$.data.fullName").value("New User"));
    }

    @Test
    @DisplayName("Should update current user profile successfully")
    void updateCurrentUserProfile_Success() throws Exception {
        // Given
        when(userService.updateProfile(anyString(), any(UpdateUserRequest.class)))
                .thenReturn(userResponse);

        // When & Then
        mockMvc.perform(put("/users/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateUserRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Profile updated successfully"));
    }

    @Test
    @DisplayName("Should return bad request when size is less than 5")
    void getUserByFullName_InvalidSize() throws Exception {
        // When & Then
        mockMvc.perform(get("/users")
                        .param("fullName", "Test")
                        .param("page", "0")
                        .param("size", "3"))
                .andExpect(status().isBadRequest());
    }
}

