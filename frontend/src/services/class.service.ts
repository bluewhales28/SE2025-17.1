import { ApiResponse, ClassResponse, CreateClassRequest, UpdateClassRequest } from "@/types/class";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
const CLASS_API_URL = `${API_BASE_URL}/classes`;

const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('accessToken') || document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1])
        : null;
    
    return {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
    };
};

export const classService = {
    async createClass(data: CreateClassRequest): Promise<ApiResponse<ClassResponse>> {
        const response = await fetch(`${CLASS_API_URL}`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "Tạo lớp học thất bại" }));
            throw new Error(error.message || error.detail || "Tạo lớp học thất bại");
        }

        return await response.json();
    },

    async getClasses(role?: "TEACHER" | "STUDENT"): Promise<ApiResponse<ClassResponse[]>> {
        const url = role ? `${CLASS_API_URL}?role=${role}` : CLASS_API_URL;
        const response = await fetch(url, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "Lấy danh sách lớp học thất bại" }));
            throw new Error(error.message || error.detail || "Lấy danh sách lớp học thất bại");
        }

        return await response.json();
    },

    async getClassById(id: number): Promise<ApiResponse<ClassResponse>> {
        const response = await fetch(`${CLASS_API_URL}/${id}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "Lấy thông tin lớp học thất bại" }));
            throw new Error(error.message || error.detail || "Lấy thông tin lớp học thất bại");
        }

        return await response.json();
    },

    async updateClass(id: number, data: UpdateClassRequest): Promise<ApiResponse<ClassResponse>> {
        const response = await fetch(`${CLASS_API_URL}/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "Cập nhật lớp học thất bại" }));
            throw new Error(error.message || error.detail || "Cập nhật lớp học thất bại");
        }

        return await response.json();
    },

    async deleteClass(id: number): Promise<ApiResponse<void>> {
        const response = await fetch(`${CLASS_API_URL}/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "Xóa lớp học thất bại" }));
            throw new Error(error.message || error.detail || "Xóa lớp học thất bại");
        }

        return await response.json();
    },

    async regenerateInvitationCode(id: number): Promise<ApiResponse<ClassResponse>> {
        const response = await fetch(`${CLASS_API_URL}/${id}/regenerate-invitation`, {
            method: "POST",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "Tạo lại mã mời thất bại" }));
            throw new Error(error.message || error.detail || "Tạo lại mã mời thất bại");
        }

        return await response.json();
    },

    async joinClassByInvitationCode(invitationCode: string): Promise<ApiResponse<ClassResponse>> {
        const response = await fetch(`${CLASS_API_URL}/join?invitationCode=${encodeURIComponent(invitationCode)}`, {
            method: "POST",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "Tham gia lớp học thất bại" }));
            throw new Error(error.message || error.detail || "Tham gia lớp học thất bại");
        }

        return await response.json();
    },
};

