package com.quizapp.user_auth_service.service;

import com.quizapp.user_auth_service.untils.Permission;
import com.quizapp.user_auth_service.untils.Role;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RolePermissionService {
    
    private final Map<Role, Set<Permission>> rolePermissions = Map.of(
        Role.USER, Set.of(
            Permission.USER_READ,
            Permission.QUIZ_READ
        ),
        Role.ADMIN, Set.of(
            Permission.USER_READ,
            Permission.USER_WRITE,
            Permission.USER_DELETE,
            Permission.QUIZ_READ,
            Permission.QUIZ_WRITE,
            Permission.QUIZ_DELETE,
            Permission.ADMIN_READ,
            Permission.ADMIN_WRITE,
            Permission.ADMIN_DELETE
        )
    );
    
    public Set<Permission> getPermissionsForRole(Role role) {
        return rolePermissions.getOrDefault(role, Set.of());
    }
    
    public boolean hasPermission(Role role, Permission permission) {
        return getPermissionsForRole(role).contains(permission);
    }
    
    public List<String> getPermissionStringsForRole(Role role) {
        return getPermissionsForRole(role)
                .stream()
                .map(Permission::getPermission)
                .collect(Collectors.toList());
    }
}
