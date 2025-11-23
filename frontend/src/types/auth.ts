export interface AuthRequest {
    email: string;
    passwordHash: string;
}

export interface AuthResponse {
    authenticated: boolean;
    token: string;
}

export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}
