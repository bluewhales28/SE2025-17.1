import { useState } from "react";
import { authService } from "@/services/auth.service";
import { AuthRequest, AuthResponse } from "@/types/auth";

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (data: AuthRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authService.login(data);
            if (response.data?.token) {
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

    return {
        login,
        isLoading,
        error,
    };
};
