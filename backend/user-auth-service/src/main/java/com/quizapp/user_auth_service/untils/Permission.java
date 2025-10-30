package com.quizapp.user_auth_service.untils;

public enum Permission {
    // User permissions
    USER_READ("user:read"),
    USER_WRITE("user:write"),
    USER_DELETE("user:delete"),
    
    // Quiz permissions
    QUIZ_READ("quiz:read"),
    QUIZ_WRITE("quiz:write"),
    QUIZ_DELETE("quiz:delete"),
    
    // Admin permissions
    ADMIN_READ("admin:read"),
    ADMIN_WRITE("admin:write"),
    ADMIN_DELETE("admin:delete");
    
    private final String permission;
    
    Permission(String permission) {
        this.permission = permission;
    }
    
    public String getPermission() {
        return permission;
    }
}
