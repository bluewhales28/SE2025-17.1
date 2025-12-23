import { ApiResponse } from "@/types/class";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export interface ClassMemberResponse {
    id: number;
    userId: number;
    userName?: string;
    email?: string;
    role: "TEACHER" | "STUDENT";
    joinedAt: string;
    className?: string;
}

const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('accessToken') || document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1])
        : null;
    
    return {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
    };
};

export const memberService = {
    async getClassMembers(classId: number): Promise<ApiResponse<ClassMemberResponse[]>> {
        const response = await fetch(`${API_BASE_URL}/classes/${classId}/members`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "Lấy danh sách thành viên thất bại" }));
            throw new Error(error.message || error.detail || "Lấy danh sách thành viên thất bại");
        }

        return await response.json();
    },

    async removeMember(classId: number, memberId: number): Promise<ApiResponse<void>> {
        const response = await fetch(`${API_BASE_URL}/classes/${classId}/members/${memberId}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "Xóa thành viên thất bại" }));
            throw new Error(error.message || error.detail || "Xóa thành viên thất bại");
        }

        return await response.json();
    },
};

