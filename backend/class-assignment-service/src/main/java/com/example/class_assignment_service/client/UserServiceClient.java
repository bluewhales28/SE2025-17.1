package com.example.class_assignment_service.client;

import com.example.class_assignment_service.exception.AppException;
import com.example.class_assignment_service.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserServiceClient {
    
    private final WebClient.Builder webClientBuilder;
    private final JdbcTemplate jdbcTemplate;
    
    @Value("${services.auth-service.url:http://localhost:8081}")
    private String authServiceUrl;
    
    // Cache email -> userId mapping to avoid repeated calls
    private final Map<String, Long> emailToUserIdCache = new ConcurrentHashMap<>();
    
    private WebClient getWebClient() {
        return webClientBuilder
            .baseUrl(authServiceUrl)
            .build();
    }
    
    /**
     * Get user ID from email
     * Priority: 1. Cache 2. Database query 3. Auth Service API
     * Uses caching to avoid repeated calls for the same email
     */
    public Long getUserIdByEmail(String email) {
        if (email == null || email.isEmpty()) {
            return null;
        }
        
        // Check cache first
        if (emailToUserIdCache.containsKey(email)) {
            log.debug("Found userId in cache for email: {}", email);
            return emailToUserIdCache.get(email);
        }
        
        // Try database query first (fastest and most reliable since both services share the same DB)
        Long userId = getUserIdFromDatabase(email);
        if (userId != null) {
            return userId;
        }
        
        // Fallback: Try Auth Service API if database query fails
        try {
            log.debug("Database query failed, trying Auth Service API for email: {}", email);
            UserInfo userInfo = getWebClient()
                .get()
                .uri(uriBuilder -> uriBuilder
                    .path("/api/users/by-email")
                    .queryParam("email", email)
                    .build())
                .retrieve()
                .onStatus(status -> status.is4xxClientError(), response -> {
                    log.warn("User not found in Auth Service for email: {}", email);
                    return Mono.error(new AppException(ErrorCode.UNAUTHORIZED, "User not found"));
                })
                .onStatus(status -> status.is5xxServerError(), response -> {
                    log.error("Auth Service error for email: {}", email);
                    return Mono.error(new AppException(ErrorCode.UNAUTHORIZED, "Auth Service unavailable"));
                })
                .bodyToMono(UserInfo.class)
                .timeout(Duration.ofSeconds(3))
                .block();
            
            if (userInfo != null && userInfo.id() != null) {
                // Cache the result
                emailToUserIdCache.put(email, userInfo.id());
                log.debug("Retrieved userId {} from Auth Service for email: {}", userInfo.id(), email);
                return userInfo.id();
            }
            
            return null;
        } catch (Exception e) {
            log.warn("Auth Service API call failed for email {}: {}", email, e.getMessage());
            return null;
        }
    }
    
    /**
     * Fallback: Query database directly to get userId from email
     * Both services use the same database, so we can query directly
     */
    private Long getUserIdFromDatabase(String email) {
        try {
            log.debug("Querying database directly for email: {}", email);
            String sql = "SELECT id FROM users WHERE email = ? LIMIT 1";
            Long userId = jdbcTemplate.queryForObject(sql, Long.class, email);
            
            if (userId != null) {
                // Cache the result
                emailToUserIdCache.put(email, userId);
                log.debug("Retrieved userId {} from database for email: {}", userId, email);
                return userId;
            }
            
            log.warn("User not found in database for email: {}", email);
            return null;
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            log.warn("User not found in database for email: {}", email);
            return null;
        } catch (Exception e) {
            log.error("Failed to get userId from database for email {}: {}", email, e.getMessage());
            return null;
        }
    }
    
    /**
     * Get user role from database by email
     */
    public String getUserRoleByEmail(String email) {
        if (email == null || email.isEmpty()) {
            return null;
        }
        
        try {
            log.debug("Querying database for role by email: {}", email);
            String sql = "SELECT role FROM users WHERE email = ? LIMIT 1";
            String role = jdbcTemplate.queryForObject(sql, String.class, email);
            
            if (role != null) {
                log.debug("Retrieved role {} from database for email: {}", role, email);
                return role;
            }
            
            log.warn("User role not found in database for email: {}", email);
            return null;
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            log.warn("User not found in database for email: {}", email);
            return null;
        } catch (Exception e) {
            log.error("Failed to get user role from database for email {}: {}", email, e.getMessage());
            return null;
        }
    }
    
    /**
     * Get user role from database by userId
     */
    public String getUserRoleById(Long userId) {
        if (userId == null) {
            return null;
        }
        
        try {
            log.debug("Querying database for role by userId: {}", userId);
            String sql = "SELECT role FROM users WHERE id = ? LIMIT 1";
            String role = jdbcTemplate.queryForObject(sql, String.class, userId);
            
            if (role != null) {
                log.debug("Retrieved role {} from database for userId: {}", role, userId);
                return role;
            }
            
            log.warn("User role not found in database for userId: {}", userId);
            return null;
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            log.warn("User not found in database for userId: {}", userId);
            return null;
        } catch (Exception e) {
            log.error("Failed to get user role from database for userId {}: {}", userId, e.getMessage());
            return null;
        }
    }

    /**
     * Get full name from database by userId
     */
    public String getUserNameById(Long userId) {
        if (userId == null) {
            return null;
        }

        try {
            log.debug("Querying database for full_name by userId: {}", userId);
            String sql = "SELECT full_name FROM users WHERE id = ? LIMIT 1";
            String name = jdbcTemplate.queryForObject(sql, String.class, userId);

            if (name != null) {
                log.debug("Retrieved full_name {} for userId: {}", name, userId);
                return name;
            }

            log.warn("User name not found in database for userId: {}", userId);
            return null;
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            log.warn("User not found in database for userId: {}", userId);
            return null;
        } catch (Exception e) {
            log.error("Failed to get user name from database for userId {}: {}", userId, e.getMessage());
            return null;
        }
    }
    
    public record UserInfo(Long id, String email, String name) {}
}

