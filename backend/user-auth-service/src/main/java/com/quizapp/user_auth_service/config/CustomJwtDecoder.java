package com.quizapp.user_auth_service.config;


import com.quizapp.user_auth_service.dto.request.IntrospectRequest;
import com.quizapp.user_auth_service.dto.response.IntrospectResponse;
import com.quizapp.user_auth_service.service.impl.AuthenticationServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;

@Component
@RequiredArgsConstructor
public class CustomJwtDecoder implements JwtDecoder {
    @NonFinal
    private static final String SIGN = "5020f057d0d31c44d2397a3265c89b86b95a1903160610e290786cfe36e43e7b";

    private final AuthenticationServiceImpl authenticationService;

    private NimbusJwtDecoder jwtDecoder;

    @Override
    public Jwt decode(String token) throws JwtException {
        if (token == null || token.isEmpty()) {
            throw new JwtException("Token is missing");
        }

        try {
            IntrospectResponse response = authenticationService.introspectToken(
                    IntrospectRequest.builder().token(token).build());


            if (!response.isActive()) {
                throw new JwtException("Token is not active");
            }


            if (jwtDecoder == null) {
                SecretKeySpec secretKeySpec = new SecretKeySpec(SIGN.getBytes(), "HS512");
                jwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                        .macAlgorithm(MacAlgorithm.HS512)
                        .build();
            }
            return jwtDecoder.decode(token);
        } catch (Exception e) {
            throw new JwtException("Failed to decode JWT: " + e.getMessage(), e);
        }
    }
}