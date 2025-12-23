import { create } from 'zustand'
import { quizService } from '@/services/quiz.service'

export interface Quiz {
    id: number
    title: string
    description: string
    timeLimit: number
    totalPoints: number
    maxAttempts: number
    isPublic: boolean
    tags: string[]
    topic: string
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    creatorId: number
    createdAt: string
    updatedAt: string
}

interface QuizState {
    quizzes: Quiz[]
    isLoading: boolean
    error: string | null

    // Actions
    fetchQuizzes: () => Promise<void>
    getQuizById: (id: number) => Promise<Quiz | null>
    createQuiz: (data: any) => Promise<Quiz | null>
    updateQuiz: (id: number, data: any) => Promise<void>
    deleteQuiz: (id: number) => Promise<void>
    clearError: () => void
}

export const useQuizStore = create<QuizState>((set, get) => ({
    quizzes: [],
    isLoading: false,
    error: null,

    fetchQuizzes: async () => {
        set({ isLoading: true, error: null })
        try {
            const quizzes = await quizService.getPublicQuizzes()
            set({ quizzes, isLoading: false })
        } catch (err: any) {
            const errorMessage = err.message || 'Không thể tải danh sách quiz'
            console.error('Error fetching quizzes:', err)
            set({ error: errorMessage, isLoading: false })
        }
    },

    getQuizById: async (id: number) => {
        set({ isLoading: true, error: null })
        try {
            const quiz = await quizService.getQuizById(id)
            set({ isLoading: false })
            return quiz
        } catch (err: any) {
            const errorMessage = err.message || 'Không tìm thấy quiz'
            console.error('Error fetching quiz:', err)
            set({ error: errorMessage, isLoading: false })
            return null
        }
    },

    createQuiz: async (data: any) => {
        set({ isLoading: true, error: null })
        try {
            const response = await quizService.createQuiz(data)
            const newQuiz = (response.data || response) as Quiz
            set((state) => ({
                quizzes: [...state.quizzes, newQuiz],
                isLoading: false
            }))
            return newQuiz
        } catch (err: any) {
            const errorMessage = err.message || 'Tạo quiz thất bại'
            console.error('Error creating quiz:', err)
            set({ error: errorMessage, isLoading: false })
            return null
        }
    },

    updateQuiz: async (id: number, data: any) => {
        set({ isLoading: true, error: null })
        try {
            await quizService.updateQuiz(id, data)
            set((state) => ({
                quizzes: state.quizzes.map((quiz) =>
                    quiz.id === id ? { ...quiz, ...data } : quiz
                ),
                isLoading: false
            }))
        } catch (err: any) {
            const errorMessage = err.message || 'Cập nhật quiz thất bại'
            console.error('Error updating quiz:', err)
            set({ error: errorMessage, isLoading: false })
        }
    },

    deleteQuiz: async (id: number) => {
        set({ isLoading: true, error: null })
        try {
            await quizService.deleteQuiz(id)
            set((state) => ({
                quizzes: state.quizzes.filter((quiz) => quiz.id !== id),
                isLoading: false
            }))
        } catch (err: any) {
            const errorMessage = err.message || 'Xóa quiz thất bại'
            console.error('Error deleting quiz:', err)
            set({ error: errorMessage, isLoading: false })
        }
    },

    clearError: () => {
        set({ error: null })
    }
}))
