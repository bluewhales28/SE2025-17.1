import { create } from 'zustand';
import { classService } from '@/services/class.service';
import { ClassResponse, CreateClassRequest, UpdateClassRequest } from '@/types/class';

interface ClassState {
    classes: ClassResponse[];
    currentClass: ClassResponse | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchClasses: (role?: "TEACHER" | "STUDENT") => Promise<void>;
    fetchClassById: (id: number) => Promise<void>;
    createClass: (data: CreateClassRequest) => Promise<ClassResponse>;
    updateClass: (id: number, data: UpdateClassRequest) => Promise<void>;
    deleteClass: (id: number) => Promise<void>;
    regenerateInvitationCode: (id: number) => Promise<void>;
    joinClass: (invitationCode: string) => Promise<ClassResponse>;
    setError: (error: string | null) => void;
    clearCurrentClass: () => void;
}

export const useClassStore = create<ClassState>((set, get) => ({
    classes: [],
    currentClass: null,
    isLoading: false,
    error: null,

    fetchClasses: async (role?: "TEACHER" | "STUDENT") => {
        set({ isLoading: true, error: null });
        try {
            const response = await classService.getClasses(role);
            set({ classes: response.data || [], isLoading: false });
        } catch (err: any) {
            const errorMessage = err.message || 'Có lỗi xảy ra khi tải danh sách lớp học';
            set({ error: errorMessage, isLoading: false });
            throw err;
        }
    },

    fetchClassById: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const response = await classService.getClassById(id);
            set({ currentClass: response.data, isLoading: false });
        } catch (err: any) {
            const errorMessage = err.message || 'Có lỗi xảy ra khi tải thông tin lớp học';
            set({ error: errorMessage, isLoading: false });
            throw err;
        }
    },

    createClass: async (data: CreateClassRequest) => {
        set({ isLoading: true, error: null });
        try {
            const response = await classService.createClass(data);
            const newClass = response.data;
            set(state => ({
                classes: [newClass, ...state.classes],
                currentClass: newClass,
                isLoading: false
            }));
            return newClass;
        } catch (err: any) {
            const errorMessage = err.message || 'Có lỗi xảy ra khi tạo lớp học';
            set({ error: errorMessage, isLoading: false });
            throw err;
        }
    },

    updateClass: async (id: number, data: UpdateClassRequest) => {
        set({ isLoading: true, error: null });
        try {
            const response = await classService.updateClass(id, data);
            const updatedClass = response.data;
            set(state => ({
                classes: state.classes.map(c => c.id === id ? updatedClass : c),
                currentClass: state.currentClass?.id === id ? updatedClass : state.currentClass,
                isLoading: false
            }));
        } catch (err: any) {
            const errorMessage = err.message || 'Có lỗi xảy ra khi cập nhật lớp học';
            set({ error: errorMessage, isLoading: false });
            throw err;
        }
    },

    deleteClass: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            await classService.deleteClass(id);
            set(state => ({
                classes: state.classes.filter(c => c.id !== id),
                currentClass: state.currentClass?.id === id ? null : state.currentClass,
                isLoading: false
            }));
        } catch (err: any) {
            const errorMessage = err.message || 'Có lỗi xảy ra khi xóa lớp học';
            set({ error: errorMessage, isLoading: false });
            throw err;
        }
    },

    regenerateInvitationCode: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const response = await classService.regenerateInvitationCode(id);
            const updatedClass = response.data;
            set(state => ({
                classes: state.classes.map(c => c.id === id ? updatedClass : c),
                currentClass: state.currentClass?.id === id ? updatedClass : state.currentClass,
                isLoading: false
            }));
        } catch (err: any) {
            const errorMessage = err.message || 'Có lỗi xảy ra khi tạo lại mã mời';
            set({ error: errorMessage, isLoading: false });
            throw err;
        }
    },

    joinClass: async (invitationCode: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await classService.joinClassByInvitationCode(invitationCode);
            const joinedClass = response.data;
            set(state => ({
                classes: state.classes.some(c => c.id === joinedClass.id) 
                    ? state.classes 
                    : [joinedClass, ...state.classes],
                currentClass: joinedClass,
                isLoading: false
            }));
            return joinedClass;
        } catch (err: any) {
            const errorMessage = err.message || 'Có lỗi xảy ra khi tham gia lớp học';
            set({ error: errorMessage, isLoading: false });
            throw err;
        }
    },

    setError: (error: string | null) => set({ error }),

    clearCurrentClass: () => set({ currentClass: null }),
}));

