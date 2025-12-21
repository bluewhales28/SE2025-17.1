package com.example.class_assignment_service.util;

import com.example.class_assignment_service.client.UserServiceClient;
import com.example.class_assignment_service.exception.AppException;
import com.example.class_assignment_service.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class SecurityUtil {
    
    private static UserServiceClient userServiceClient;
    
    @Autowired
    public void setUserServiceClient(UserServiceClient userServiceClient) {
        SecurityUtil.userServiceClient = userServiceClient;
    }
    
    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() != null) {
            String principal = authentication.getPrincipal().toString();
            
            // If principal starts with "email:", it means we have email but not userId
            if (principal.startsWith("email:")) {
                String email = principal.substring(6); // Remove "email:" prefix
                log.debug("JWT token contains email ({}), attempting to get userId from Auth Service", email);
                
                // Try to get userId from Auth Service
                if (userServiceClient != null) {
                    Long userId = userServiceClient.getUserIdByEmail(email);
                    if (userId != null) {
                        log.debug("Successfully retrieved userId {} for email: {}", userId, email);
                        return userId;
                    }
                }
                
                log.error("JWT token contains email ({}) but not userId, and failed to retrieve userId from Auth Service.", email);
                throw new AppException(ErrorCode.UNAUTHORIZED, 
                    "JWT token missing userId claim. Please contact administrator to update Auth Service to include userId in token.");
            }
            
            try {
                return Long.parseLong(principal);
            } catch (NumberFormatException e) {
                log.error("Failed to parse userId from principal: {}", principal);
                return null;
            }
        }
        return null;
    }
    
    public static String getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getAuthorities() != null && !authentication.getAuthorities().isEmpty()) {
            try {
                String role = authentication.getAuthorities().iterator().next().getAuthority();
                // If role is ROLE_USER (default), try to get actual role from database
                if ("ROLE_USER".equals(role) && userServiceClient != null) {
                    String principal = authentication.getPrincipal().toString();
                    String actualRole = null;
                    
                    if (principal.startsWith("email:")) {
                        String email = principal.substring(6);
                        actualRole = userServiceClient.getUserRoleByEmail(email);
                    } else {
                        try {
                            Long userId = Long.parseLong(principal);
                            actualRole = userServiceClient.getUserRoleById(userId);
                        } catch (NumberFormatException e) {
                            // Not a valid userId
                        }
                    }
                    
                    if (actualRole != null && !actualRole.isEmpty()) {
                        log.debug("Retrieved actual role {} from database, replacing ROLE_USER", actualRole);
                        return "ROLE_" + actualRole;
                    }
                }
                return role;
            } catch (Exception e) {
                log.warn("Failed to get role from authorities: {}", e.getMessage());
                // Default to ROLE_USER if we can't determine role
                return "ROLE_USER";
            }
        }
        // If no authorities, default to ROLE_USER for authenticated users
        if (authentication != null && authentication.isAuthenticated()) {
            log.debug("No authorities found, defaulting to ROLE_USER");
            return "ROLE_USER";
        }
        return null;
    }
}

