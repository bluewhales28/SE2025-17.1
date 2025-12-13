package com.example.class_assignment_service.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Value("${app.jwt.secret}")
    private String jwtSecret;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            String token = authHeader.substring(7);
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            
            Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
            
            // Try to get userId from claims first, fallback to subject
            String userIdStr = null;
            String email = null;
            Object userIdClaim = claims.get("userId");
            if (userIdClaim != null) {
                userIdStr = userIdClaim.toString();
            } else {
                // If no userId claim, try to parse subject as Long
                String subject = claims.getSubject();
                if (subject != null) {
                    try {
                        // Try to parse as Long (if it's a number)
                        Long.parseLong(subject);
                        userIdStr = subject;
                    } catch (NumberFormatException e) {
                        // Subject is email, not user ID - store email for later lookup
                        email = subject;
                        log.debug("JWT token subject is email: {}. Will need to lookup userId.", email);
                    }
                }
            }
            
            if (userIdStr == null && email == null) {
                log.warn("JWT token missing both userId and email");
                filterChain.doFilter(request, response);
                return;
            }
            
            String role = claims.get("role", String.class);
            if (role == null || role.isEmpty()) {
                log.warn("JWT token missing role, defaulting to USER. SecurityUtil will query database for actual role when needed.");
                role = "USER";
            }
            
            List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
            
            // Store userId if available, otherwise store email with prefix "email:"
            String principal = userIdStr != null ? userIdStr : ("email:" + email);
            
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(principal, null, authorities);
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.debug("JWT authentication successful for principal: {}, role: {}", principal, role);
            
        } catch (Exception e) {
            log.error("JWT authentication failed: {}", e.getMessage(), e);
        }
        
        filterChain.doFilter(request, response);
    }
}

