import { ApiResponse, AuthRequest, AuthResponse, RegisterRequest } from "@/types/auth";

const AUTH_API_URL = "/api/v1/auth";
const USER_API_URL = "/api/v1/users";

export const authService = {
    async login(data: AuthRequest): Promise<ApiResponse<AuthResponse>> {
        const response = await fetch(`${AUTH_API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Đăng nhập thất bại");
        }

        return result;
    },

    async register(data: RegisterRequest): Promise<ApiResponse<any>> {
        const response = await fetch(`${USER_API_URL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Đăng ký thất bại");
        }

        return result;
    },
};
