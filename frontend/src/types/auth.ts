export interface AuthRequest {
    email: string;
    password: string;
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

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    dateOfBirth: string; // YYYY-MM-DD
    gender: "MALE" | "FEMALE" | "OTHER";
    role: "USER";
}
