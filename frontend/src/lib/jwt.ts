/**
 * Decode JWT token để lấy thông tin user
 * Không verify signature - chỉ decode payload
 */
export interface JWTPayload {
    sub: string; // email
    iss: string; // issuer
    iat: number; // issued at
    exp: number; // expiration
    jti: string; // jwt id
    scope: string; // permissions (chứa role info)
}

export interface UserInfo {
    email: string;
    role: 'USER' | 'ADMIN' | 'TEACHER';
    permissions: string[];
    exp: number;
}

/**
 * Decode JWT token không cần verify signature
 * @param token JWT token string
 * @returns Decoded payload hoặc null nếu invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        // Decode base64url payload (phần giữa)
        const payload = parts[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload) as JWTPayload;
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}

/**
 * Parse thông tin user từ JWT token
 * @param token JWT token string
 * @returns User info hoặc null nếu invalid
 */
export function getUserInfoFromToken(token: string): UserInfo | null {
    const payload = decodeJWT(token);
    if (!payload) {
        console.error('❌ Failed to decode token');
        return null;
    }

    // Parse permissions từ scope string
    const permissions = payload.scope ? payload.scope.split(' ') : [];
    console.log('🔑 Token permissions:', permissions);

    // Xác định role dựa trên permissions
    // Admin có quyền: admin:read, admin:write, admin:delete
    // Teacher có quyền: teacher:read, teacher:write
    let role: 'USER' | 'ADMIN' | 'TEACHER' = 'USER';

    const hasAdminPermission = permissions.some(p => p.startsWith('admin:'));
    const hasTeacherPermission = permissions.some(p => p.startsWith('teacher:'));

    if (hasAdminPermission) {
        role = 'ADMIN';
    } else if (hasTeacherPermission) {
        role = 'TEACHER';
    }

    console.log('👑 Detected role:', role);

    return {
        email: payload.sub,
        role,
        permissions,
        exp: payload.exp
    };
}

/**
 * Kiểm tra token còn hạn không
 * @param token JWT token string
 * @returns true nếu còn hạn, false nếu hết hạn hoặc invalid
 */
export function isTokenValid(token: string): boolean {
    const payload = decodeJWT(token);
    if (!payload) {
        return false;
    }

    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
}
