export interface CreateClassRequest {
    name: string;
    description?: string;
    subject?: string;
}

export interface UpdateClassRequest {
    name?: string;
    description?: string;
    subject?: string;
    status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
}

export enum ClassStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    ARCHIVED = "ARCHIVED"
}

export interface ClassResponse {
    id: number;
    name: string;
    description?: string;
    subject?: string;
    status: ClassStatus;
    invitationCode: string;
    invitationLink: string;
    createdBy: number;
    createdAt: string;
    updatedAt: string;
    memberCount: number;
    assignmentCount: number;
    userRole?: "TEACHER" | "STUDENT"; // Role of current user in this class
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

