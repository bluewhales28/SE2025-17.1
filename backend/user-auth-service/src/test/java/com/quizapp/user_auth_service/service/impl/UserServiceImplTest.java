package com.quizapp.user_auth_service.service.impl;

import com.quizapp.user_auth_service.dto.request.UpdateUserRequest;
import com.quizapp.user_auth_service.dto.request.UserRequest;
import com.quizapp.user_auth_service.dto.response.PageResponse;
import com.quizapp.user_auth_service.dto.response.UserResponse;
import com.quizapp.user_auth_service.exception.AppException;
import com.quizapp.user_auth_service.exception.ErrorCode;
import com.quizapp.user_auth_service.mapper.UserMapper;
import com.quizapp.user_auth_service.model.User;
import com.quizapp.user_auth_service.repository.UserRepository;
import com.quizapp.user_auth_service.service.PasswordService;
import com.quizapp.user_auth_service.untils.Gender;
import com.quizapp.user_auth_service.untils.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserServiceImpl Tests")
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordService passwordService;

    @InjectMocks
    private UserServiceImpl userService;

    private User testUser;
    private UserRequest userRequest;
    private UserResponse userResponse;
    private UpdateUserRequest updateUserRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .email("test@example.com")
                .passwordHash("hashedPassword")
                .fullName("Test User")
                .phoneNumber("0123456789")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .gender(Gender.MALE)
                .role(Role.USER)
                .isEmailVerified(true)
                .build();
        testUser.setId(1L);

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
                .fullName("Test User")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .gender(Gender.MALE)
                .role(Role.USER)
                .build();

        updateUserRequest = UpdateUserRequest.builder()
                .fullName("Updated Name")
                .email("updated@example.com")
                .phoneNumber("0111111111")
                .dateOfBirth(LocalDate.of(1992, 3, 20))
                .passwordHash("newPassword123")
                .build();
    }

    @Test
    @DisplayName("Should save user successfully")
    void save_Success() {
        // Given
        when(userRepository.existsByEmail(userRequest.getEmail())).thenReturn(false);
        when(userMapper.toUser(userRequest)).thenReturn(testUser);
        when(passwordService.hashPassword(userRequest.getPasswordHash())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(userMapper.toUserReponse(testUser)).thenReturn(userResponse);

        // When
        UserResponse response = userService.save(userRequest);

        // Then
        assertNotNull(response);
        assertEquals(userResponse.getId(), response.getId());
        verify(userRepository, times(1)).existsByEmail(userRequest.getEmail());
        verify(passwordService, times(1)).hashPassword(userRequest.getPasswordHash());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when user already exists")
    void save_UserExists() {
        // Given
        when(userRepository.existsByEmail(userRequest.getEmail())).thenReturn(true);

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> userService.save(userRequest));
        
        assertEquals(ErrorCode.USER_EXISTED, exception.getErrorCode());
        verify(userRepository, times(1)).existsByEmail(userRequest.getEmail());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should update user successfully")
    void update_Success() {
        // Given
        Long userId = 1L;
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(passwordService.hashPassword(updateUserRequest.getPasswordHash())).thenReturn("newHashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        assertDoesNotThrow(() -> userService.update(userId, updateUserRequest));

        // Then
        verify(userRepository, times(1)).findById(userId);
        verify(passwordService, times(1)).hashPassword(updateUserRequest.getPasswordHash());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should update user without password when password is null")
    void update_WithoutPassword() {
        // Given
        Long userId = 1L;
        UpdateUserRequest updateRequest = UpdateUserRequest.builder()
                .fullName("Updated Name")
                .email("updated@example.com")
                .phoneNumber("0111111111")
                .dateOfBirth(LocalDate.of(1992, 3, 20))
                .passwordHash(null)
                .build();
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        assertDoesNotThrow(() -> userService.update(userId, updateRequest));

        // Then
        verify(userRepository, times(1)).findById(userId);
        verify(passwordService, never()).hashPassword(anyString());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when user not found for update")
    void update_UserNotFound() {
        // Given
        Long userId = 999L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> userService.update(userId, updateUserRequest));
        
        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(userRepository, times(1)).findById(userId);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should find user by email successfully")
    void findByEmail_Success() {
        // Given
        String email = "test@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        when(userMapper.toUserReponse(testUser)).thenReturn(userResponse);

        // When
        UserResponse response = userService.findByEmail(email);

        // Then
        assertNotNull(response);
        assertEquals(userResponse.getId(), response.getId());
        verify(userRepository, times(1)).findByEmail(email);
    }

    @Test
    @DisplayName("Should throw exception when user not found by email")
    void findByEmail_UserNotFound() {
        // Given
        String email = "notfound@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> userService.findByEmail(email));
        
        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(userRepository, times(1)).findByEmail(email);
    }

    @Test
    @DisplayName("Should find users by full name successfully")
    void findByFullName_Success() {
        // Given
        String fullName = "Test";
        int page = 0;
        int size = 10;
        
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage = new PageImpl<>(Arrays.asList(testUser), pageable, 1);
        
        when(userRepository.existsByFullName(fullName)).thenReturn(true);
        when(userRepository.findUsersByFullNameContaining(fullName, pageable)).thenReturn(userPage);
        when(userMapper.toUserResponseList(anyList())).thenReturn(Arrays.asList(userResponse));

        // When
        PageResponse<?> response = userService.findByFullName(fullName, page, size);

        // Then
        assertNotNull(response);
        assertEquals(0, response.getPage());
        assertEquals(10, response.getSize());
        verify(userRepository, times(1)).existsByFullName(fullName);
        verify(userRepository, times(1)).findUsersByFullNameContaining(fullName, pageable);
    }

    @Test
    @DisplayName("Should throw exception when no users found by full name")
    void findByFullName_NotFound() {
        // Given
        String fullName = "NonExistent";
        when(userRepository.existsByFullName(fullName)).thenReturn(false);

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> userService.findByFullName(fullName, 0, 10));
        
        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(userRepository, times(1)).existsByFullName(fullName);
        verify(userRepository, never()).findUsersByFullNameContaining(anyString(), any(Pageable.class));
    }

    @Test
    @DisplayName("Should find all users successfully")
    void findAll_Success() {
        // Given
        int page = 0;
        int size = 10;
        String sortBy = "id";
        
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage = new PageImpl<>(Arrays.asList(testUser), pageable, 1);
        
        when(userRepository.findAll(pageable)).thenReturn(userPage);
        when(userMapper.toUserResponseList(anyList())).thenReturn(Arrays.asList(userResponse));

        // When
        PageResponse<?> response = userService.findAll(page, size, sortBy);

        // Then
        assertNotNull(response);
        assertEquals(0, response.getPage());
        assertEquals(10, response.getSize());
        verify(userRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("Should update profile successfully")
    void updateProfile_Success() {
        // Given
        String email = "test@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        when(passwordService.hashPassword(updateUserRequest.getPasswordHash())).thenReturn("newHashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(userMapper.toUserReponse(testUser)).thenReturn(userResponse);

        // When
        UserResponse response = userService.updateProfile(email, updateUserRequest);

        // Then
        assertNotNull(response);
        verify(userRepository, times(1)).findByEmail(email);
        verify(passwordService, times(1)).hashPassword(updateUserRequest.getPasswordHash());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when user not found for profile update")
    void updateProfile_UserNotFound() {
        // Given
        String email = "notfound@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> userService.updateProfile(email, updateUserRequest));
        
        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(userRepository, times(1)).findByEmail(email);
        verify(userRepository, never()).save(any(User.class));
    }
}

