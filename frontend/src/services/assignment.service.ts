import { ApiResponse } from "@/types/class";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export interface AssignmentResponse {
    id: number;
    classId: number;
    quizId: number;
    title: string;
    description?: string;
    openTime: string;
    deadline: string;
    allowRetake: boolean;
    maxAttempts?: number;
    maxScore?: number;
    createdAt: string;
    updatedAt: string;
    userStatus?: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "OVERDUE"; // Status for current user
    userAttemptCount?: number; // Number of attempts by current user
}

export interface CreateAssignmentRequest {
    classId: number;
    quizId: number;
    title: string;
    description?: string;
    openTime: string;
    deadline: string;
    allowRetake: boolean;
    maxAttempts?: number;
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

export const assignmentService = {
    async getAssignmentsByClass(classId: number): Promise<ApiResponse<AssignmentResponse[]>> {
        const response = await fetch(`${API_BASE_URL}/assignments/class/${classId}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "Lấy danh sách bài tập thất bại" }));
            throw new Error(error.message || error.detail || "Lấy danh sách bài tập thất bại");
        }

        return await response.json();
    },

    async createAssignment(data: CreateAssignmentRequest): Promise<ApiResponse<AssignmentResponse>> {
        const response = await fetch(`${API_BASE_URL}/assignments`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "Tạo bài tập thất bại" }));
            throw new Error(error.message || error.detail || "Tạo bài tập thất bại");
        }

        return await response.json();
    },

    async getAssignmentById(assignmentId: number): Promise<ApiResponse<AssignmentResponse>> {
        const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "Lấy thông tin bài tập thất bại" }));
            throw new Error(error.message || error.detail || "Lấy thông tin bài tập thất bại");
        }

        return await response.json();
    },
};

