package com.quizapp.user_auth_service.service.impl;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.quizapp.user_auth_service.dto.request.AuthRequest;
import com.quizapp.user_auth_service.dto.request.IntrospectRequest;
import com.quizapp.user_auth_service.dto.request.LogoutRequest;
import com.quizapp.user_auth_service.dto.request.RefreshToken;
import com.quizapp.user_auth_service.dto.response.AuthResponse;
import com.quizapp.user_auth_service.dto.response.IntrospectResponse;
import com.quizapp.user_auth_service.exception.AppException;
import com.quizapp.user_auth_service.exception.ErrorCode;
import com.quizapp.user_auth_service.model.InvalidToken;
import com.quizapp.user_auth_service.model.User;
import com.quizapp.user_auth_service.repository.InvalidTokenRepository;
import com.quizapp.user_auth_service.repository.UserRepository;
import com.quizapp.user_auth_service.service.PasswordService;
import com.quizapp.user_auth_service.service.RolePermissionService;
import com.quizapp.user_auth_service.untils.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthenticationServiceImpl Tests")
class AuthenticationServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private InvalidTokenRepository invalidTokenRepository;

    @Mock
    private PasswordService passwordService;

    @Mock
    private RolePermissionService rolePermissionService;

    @InjectMocks
    private AuthenticationServiceImpl authenticationService;

    private User testUser;
    private AuthRequest authRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .email("test@example.com")
                .passwordHash("hashedPassword")
                .fullName("Test User")
                .role(Role.USER)
                .isEmailVerified(true)
                .build();
        testUser.setId(1L);

        authRequest = AuthRequest.builder()
                .email("test@example.com")
                .passwordHash("password123")
                .build();
    }

    @Test
    @DisplayName("Should authenticate user successfully with valid credentials")
    void authenticateUser_Success() {
        // Given
        when(userRepository.findByEmail(authRequest.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordService.verifyPassword(authRequest.getPasswordHash(), testUser.getPasswordHash()))
                .thenReturn(true);
        when(rolePermissionService.getPermissionStringsForRole(testUser.getRole()))
                .thenReturn(List.of("USER_READ", "QUIZ_READ"));

        // When
        AuthResponse response = authenticationService.authenticateUser(authRequest);

        // Then
        assertNotNull(response);
        assertTrue(response.isAuthenticated());
        assertNotNull(response.getToken());
        
        verify(userRepository, times(1)).findByEmail(authRequest.getEmail());
        verify(passwordService, times(1)).verifyPassword(authRequest.getPasswordHash(), testUser.getPasswordHash());
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void authenticateUser_UserNotFound() {
        // Given
        when(userRepository.findByEmail(authRequest.getEmail())).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> authenticationService.authenticateUser(authRequest));
        
        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(userRepository, times(1)).findByEmail(authRequest.getEmail());
        verify(passwordService, never()).verifyPassword(anyString(), anyString());
    }

    @Test
    @DisplayName("Should throw exception when password is invalid")
    void authenticateUser_InvalidPassword() {
        // Given
        when(userRepository.findByEmail(authRequest.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordService.verifyPassword(authRequest.getPasswordHash(), testUser.getPasswordHash()))
                .thenReturn(false);

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> authenticationService.authenticateUser(authRequest));
        
        assertEquals(ErrorCode.INVALID_CREDENTIALS, exception.getErrorCode());
        verify(passwordService, times(1)).verifyPassword(authRequest.getPasswordHash(), testUser.getPasswordHash());
    }

    @Test
    @DisplayName("Should introspect valid token successfully")
    void introspectToken_Success() throws Exception {
        // Given
        String validToken = createValidToken();
        IntrospectRequest request = IntrospectRequest.builder().token(validToken).build();
        when(invalidTokenRepository.existsByToken(anyString())).thenReturn(false);

        // When
        IntrospectResponse response = authenticationService.introspectToken(request);

        // Then
        assertNotNull(response);
        assertTrue(response.isActive());
        verify(invalidTokenRepository, times(1)).existsByToken(anyString());
    }

    @Test
    @DisplayName("Should return inactive for introspected invalidated token")
    void introspectToken_TokenInvalidated() throws Exception {
        // Given
        String validToken = createValidToken();
        IntrospectRequest request = IntrospectRequest.builder().token(validToken).build();
        when(invalidTokenRepository.existsByToken(anyString())).thenReturn(true);

        // When
        IntrospectResponse response = authenticationService.introspectToken(request);

        // Then
        assertNotNull(response);
        assertFalse(response.isActive());
    }

    @Test
    @DisplayName("Should return inactive when token is missing")
    void introspectToken_TokenMissing() {
        // Given
        IntrospectRequest request = IntrospectRequest.builder().token(null).build();

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> authenticationService.introspectToken(request));
        
        assertEquals(ErrorCode.TOKEN_MISSING, exception.getErrorCode());
    }

    @Test
    @DisplayName("Should logout successfully")
    void logOut_Success() throws Exception {
        // Given
        String validToken = createValidToken();
        LogoutRequest logoutRequest = LogoutRequest.builder().token(validToken).build();
        when(invalidTokenRepository.existsByToken(anyString())).thenReturn(false);
        when(invalidTokenRepository.save(any(InvalidToken.class))).thenReturn(new InvalidToken());

        // When
        assertDoesNotThrow(() -> authenticationService.logOut(logoutRequest));

        // Then
        verify(invalidTokenRepository, times(1)).save(any(InvalidToken.class));
    }

    @Test
    @DisplayName("Should throw exception when logout token is missing")
    void logOut_TokenMissing() {
        // Given
        LogoutRequest logoutRequest = LogoutRequest.builder().token(null).build();

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> authenticationService.logOut(logoutRequest));
        
        assertEquals(ErrorCode.TOKEN_MISSING, exception.getErrorCode());
        verify(invalidTokenRepository, never()).save(any(InvalidToken.class));
    }

    @Test
    @DisplayName("Should refresh token successfully")
    void refreshToken_Success() throws Exception {
        // Given
        String validToken = createValidToken();
        RefreshToken refreshToken = RefreshToken.builder().token(validToken).build();
        when(invalidTokenRepository.existsByToken(anyString())).thenReturn(false);
        when(invalidTokenRepository.save(any(InvalidToken.class))).thenReturn(new InvalidToken());
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(rolePermissionService.getPermissionStringsForRole(testUser.getRole()))
                .thenReturn(List.of("USER_READ", "QUIZ_READ"));

        // When
        AuthResponse response = authenticationService.refreshToken(refreshToken);

        // Then
        assertNotNull(response);
        assertTrue(response.isAuthenticated());
        assertNotNull(response.getToken());
        verify(invalidTokenRepository, times(1)).save(any(InvalidToken.class));
        verify(userRepository, times(1)).findByEmail(testUser.getEmail());
    }

    @Test
    @DisplayName("Should throw exception when user not found during refresh")
    void refreshToken_UserNotFound() throws Exception {
        // Given
        String validToken = createValidToken();
        RefreshToken refreshToken = RefreshToken.builder().token(validToken).build();
        when(invalidTokenRepository.existsByToken(anyString())).thenReturn(false);
        when(invalidTokenRepository.save(any(InvalidToken.class))).thenReturn(new InvalidToken());
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> authenticationService.refreshToken(refreshToken));
        
        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    @DisplayName("Should verify token successfully")
    void verifyToken_Success() throws Exception {
        // Given
        String validToken = createValidToken();
        when(invalidTokenRepository.existsByToken(anyString())).thenReturn(false);

        // When
        SignedJWT result = authenticationService.verifyToken(validToken);

        // Then
        assertNotNull(result);
        assertEquals(testUser.getEmail(), result.getJWTClaimsSet().getSubject());
    }

    @Test
    @DisplayName("Should throw exception when token is null")
    void verifyToken_NullToken() {
        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> authenticationService.verifyToken(null));
        
        assertEquals(ErrorCode.TOKEN_MISSING, exception.getErrorCode());
    }

    @Test
    @DisplayName("Should throw exception when token is empty")
    void verifyToken_EmptyToken() {
        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> authenticationService.verifyToken(""));
        
        assertEquals(ErrorCode.TOKEN_MISSING, exception.getErrorCode());
    }

    @Test
    @DisplayName("Should throw exception when token is invalidated")
    void verifyToken_TokenInvalidated() throws Exception {
        // Given
        String validToken = createValidToken();
        when(invalidTokenRepository.existsByToken(anyString())).thenReturn(true);

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> authenticationService.verifyToken(validToken));
        
        assertEquals(ErrorCode.TOKEN_EXPIRED, exception.getErrorCode());
    }

    // Helper method to create a valid token for testing
    private String createValidToken() throws Exception {
        String SIGN = "5020f057d0d31c44d2397a3265c89b86b95a1903160610e290786cfe36e43e7b";
        
        JWSHeader jwsHeader = new JWSHeader.Builder(JWSAlgorithm.HS512)
                .type(JOSEObjectType.JWT)
                .build();
        
        String jti = UUID.randomUUID().toString();
        Date now = new Date();
        Date expirationTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
        
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject("test@example.com")
                .issuer("webmovie")
                .issueTime(now)
                .expirationTime(expirationTime)
                .jwtID(jti)
                .claim("scope", "USER_READ QUIZ_READ")
                .build();
        
        SignedJWT signedJWT = new SignedJWT(jwsHeader, jwtClaimsSet);
        JWSSigner signer = new MACSigner(SIGN.getBytes());
        signedJWT.sign(signer);
        
        return signedJWT.serialize();
    }
}

