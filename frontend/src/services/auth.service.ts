import { ApiResponse, AuthRequest, AuthResponse, RegisterRequest } from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
const AUTH_API_URL = `${API_BASE_URL}/auth`;
const USER_API_URL = `${API_BASE_URL}/users`;

export const authService = {
    async login(data: AuthRequest): Promise<ApiResponse<AuthResponse>> {
        const response = await fetch(`${AUTH_API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || result.message || "Đăng nhập thất bại");
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

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || result.message || "Đăng ký thất bại");
        }

        return result;
    },

    async forgotPassword(email: string): Promise<ApiResponse<any>> {
        const response = await fetch(`${AUTH_API_URL}/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Gửi yêu cầu thất bại");
        }

        return result;
    },

    async resetPassword(token: string, newPassword: string): Promise<ApiResponse<any>> {
        const response = await fetch(`${AUTH_API_URL}/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token, newPassword }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Đặt lại mật khẩu thất bại");
        }

        return result;
    },

    async logout(token: string): Promise<ApiResponse<any>> {
        const response = await fetch(`${AUTH_API_URL}/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Đăng xuất thất bại");
        }

        return result;
    },
};
