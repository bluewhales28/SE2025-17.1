import { ApiResponse, AuthRequest, AuthResponse } from "@/types/auth";

const API_URL = "http://localhost:8082/auth";

export const authService = {
    async login(data: AuthRequest): Promise<ApiResponse<AuthResponse>> {
        const response = await fetch(`${API_URL}/login`, {
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
};
