import { useState } from "react";
import { authService } from "@/services/auth.service";
import { AuthRequest, AuthResponse, RegisterRequest } from "@/types/auth";
import Cookies from "js-cookie";

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (data: AuthRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authService.login(data);
            if (response.data?.token) {
                // Lưu token vào Cookie để Middleware có thể đọc được
                Cookies.set("accessToken", response.data.token, { expires: 1 }); // Hết hạn sau 1 ngày
                // Vẫn lưu localStorage nếu cần dùng ở client components khác
                localStorage.setItem("accessToken", response.data.token);
            }
            return response;
        } catch (err: any) {
            setError(err.message || "Có lỗi xảy ra");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authService.register(data);
            return response;
        } catch (err: any) {
            setError(err.message || "Có lỗi xảy ra");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            const token = Cookies.get("accessToken") || localStorage.getItem("accessToken");
            if (token) {
                // Call API logout để invalidate token ở server
                await authService.logout(token);
            }
        } catch (err: any) {
            console.error("Logout API error:", err);
            // Vẫn tiếp tục logout ở client dù API fail
        } finally {
            // Xóa token ở client
            Cookies.remove("accessToken");
            localStorage.removeItem("accessToken");
            setIsLoading(false);
            window.location.href = "/";
        }
    };

    return {
        login,
        register,
        logout,
        isLoading,
        error,
    };
};
