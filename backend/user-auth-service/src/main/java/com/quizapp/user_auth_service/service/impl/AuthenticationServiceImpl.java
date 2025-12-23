package com.quizapp.user_auth_service.service.impl;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
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
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl {
    private final UserRepository userRepository;
    private final InvalidTokenRepository invalidTokenRepository;
    private final PasswordService passwordService;
    private final RolePermissionService rolePermissionService;

    @NonFinal
    private static final String SIGN = "5020f057d0d31c44d2397a3265c89b86b95a1903160610e290786cfe36e43e7b";

    public AuthResponse authenticateUser(AuthRequest authRequest) {
        User user = userRepository.findByEmail(authRequest.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!passwordService.verifyPassword(authRequest.getPassword(), user.getPasswordHash())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        String token = generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .authenticated(true)
                .build();
    }

    public IntrospectResponse introspectToken(IntrospectRequest request) {
        if (request == null || request.getToken() == null) {
            log.warn("Token introspection failed: Token is missing");
            throw new AppException(ErrorCode.TOKEN_MISSING);
        }

        try {
            String token = request.getToken();
            log.debug("Introspecting token: {}", token.substring(0, Math.min(20, token.length())) + "...");
            
            SignedJWT signedJWT = verifyToken(token);

            // Check if token has been invalidated
            String jti = signedJWT.getJWTClaimsSet().getJWTID();
            if (invalidTokenRepository.existsByToken(jti)) {
                log.warn("Token introspection failed: Token has been invalidated (JTI: {})", jti);
                return IntrospectResponse.builder()
                        .active(false)
                        .build();
            }

            log.debug("Token introspection successful: active=true");
            return IntrospectResponse.builder()
                    .active(true)
                    .build();
        } catch (AppException e) {
            log.warn("Token introspection failed: {} - {}", e.getErrorCode().getMessage(), e.getMessage());
            return IntrospectResponse.builder()
                    .active(false)
                    .error(e.getErrorCode().getMessage())
                    .build();
        } catch (Exception e) {
            log.error("Unexpected error during token introspection", e);
            return IntrospectResponse.builder()
                    .active(false)
                    .error("Unexpected error: " + e.getMessage())
                    .build();
        }
    }

    public void logOut(LogoutRequest logOutRequest) {
        if (logOutRequest == null || logOutRequest.getToken() == null) {
            throw new AppException(ErrorCode.TOKEN_MISSING);
        }

        try {
            SignedJWT signedJWT = verifyToken(logOutRequest.getToken());
            String jti = signedJWT.getJWTClaimsSet().getJWTID();
            Date expiresAt = signedJWT.getJWTClaimsSet().getExpirationTime();

            InvalidToken invalidToken = InvalidToken.builder()
                    .token(jti)
                    .expirationTime(expiresAt)
                    .build();

            invalidTokenRepository.save(invalidToken);
        } catch (ParseException e) {
            throw new AppException(ErrorCode.MALFORMED_TOKEN);
        } catch (AppException e) {
            throw new AppException(ErrorCode.INVALID_SIGNATURE);
        } catch (Exception e) {
            throw new AppException(ErrorCode.UNEXPECTED_ERROR);
        }
    }

    public AuthResponse refreshToken(RefreshToken token) throws ParseException , JOSEException {
        var signJWT = verifyToken(token.getToken());

        var jit = signJWT.getJWTClaimsSet().getJWTID();
        var expirationTime = signJWT.getJWTClaimsSet().getExpirationTime();

        InvalidToken invalidToken = InvalidToken.builder()
                .token(jit)
                .expirationTime(expirationTime)
                .build();
        invalidTokenRepository.save(invalidToken);

        var email = signJWT.getJWTClaimsSet().getSubject();
        var user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        var newToken = generateToken(user);

        return AuthResponse.builder()
                .token(newToken)
                .authenticated(true)
                .build();
    }

    public SignedJWT verifyToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new AppException(ErrorCode.TOKEN_MISSING);
        }

        try {
            // Parse JWT token
            SignedJWT signedJWT = SignedJWT.parse(token);

            // Get JWT Claims
            JWTClaimsSet claimsSet = signedJWT.getJWTClaimsSet();
            if (claimsSet == null) {
                throw new AppException(ErrorCode.MALFORMED_TOKEN);
            }

            // Check if token has expired
            Date expirationTime = claimsSet.getExpirationTime();
            if (expirationTime == null) {
                throw new AppException(ErrorCode.MALFORMED_TOKEN);
            }

            if (expirationTime.before(new Date())) {
                throw new AppException(ErrorCode.TOKEN_EXPIRED);
            }

            // Verify token signature
            JWSVerifier verifier = new MACVerifier(SIGN.getBytes());
            boolean verified = signedJWT.verify(verifier);
            if (!verified) {
                throw new AppException(ErrorCode.INVALID_SIGNATURE);
            }

            // Check if token has been invalidated (using JTI)
            String jti = claimsSet.getJWTID();
            if (jti != null && invalidTokenRepository.existsByToken(jti)) {
                throw new AppException(ErrorCode.TOKEN_EXPIRED);
            }

            return signedJWT;
        } catch (ParseException e) {
            throw new AppException(ErrorCode.MALFORMED_TOKEN);
        } catch (JOSEException e) {
            throw new AppException(ErrorCode.INVALID_SIGNATURE);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during token verification", e);
            throw new AppException(ErrorCode.UNEXPECTED_ERROR);
        }
    }

    private String generateToken(User user) {
        try {
            JWSHeader jwsHeader = new JWSHeader.Builder(JWSAlgorithm.HS512)
                    .type(JOSEObjectType.JWT)
                    .build();

            String jti = UUID.randomUUID().toString();
            Date now = new Date();
            Date expirationTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

            JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                    .subject(user.getEmail())
                    .issuer("webmovie")
                    .issueTime(now)
                    .expirationTime(expirationTime)
                    .jwtID(jti)
                    .claim("scope", buildScope(user))
                    .build();

            SignedJWT signedJWT = new SignedJWT(jwsHeader, jwtClaimsSet);
            JWSSigner signer = new MACSigner(SIGN.getBytes());
            signedJWT.sign(signer);

            return signedJWT.serialize();
        } catch (JOSEException e) {
            log.error("Error while generating token", e);
            throw new AppException(ErrorCode.TOKEN_GENERATION_FAILED);
        }
    }

    private String buildScope(User user) {
        List<String> permissions = rolePermissionService.getPermissionStringsForRole(user.getRole());
        return String.join(" ", permissions);
    }
}