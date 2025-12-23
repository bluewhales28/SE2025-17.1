import { create } from 'zustand'
import { questionService } from '@/services/question.service'

export interface Answer {
    id: number
    content: string
    isCorrect: boolean
    questionId: number
}

export interface Question {
    id: number
    content: string
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY'
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    points: number
    tags: string[]
    quizId: number
    answers?: Answer[]
}

interface QuestionState {
    questions: Question[]
    isLoading: boolean
    error: string | null

    // Actions
    fetchQuestions: () => Promise<void>
    getQuestionById: (id: number) => Promise<Question | null>
    createQuestion: (data: any) => Promise<Question | null>
    updateQuestion: (id: number, data: any) => Promise<void>
    deleteQuestion: (id: number) => Promise<void>
    clearError: () => void
}

export const useQuestionStore = create<QuestionState>((set, get) => ({
    questions: [],
    isLoading: false,
    error: null,

    fetchQuestions: async () => {
        set({ isLoading: true, error: null })
        try {
            const questions = await questionService.getQuestions()
            set({ questions, isLoading: false })
        } catch (err: any) {
            const errorMessage = err.message || 'Không thể tải danh sách câu hỏi'
            console.error('Error fetching questions:', err)
            set({ error: errorMessage, isLoading: false })
        }
    },

    getQuestionById: async (id: number) => {
        set({ isLoading: true, error: null })
        try {
            const question = await questionService.getQuestionById(id)
            set({ isLoading: false })
            return question
        } catch (err: any) {
            const errorMessage = err.message || 'Không tìm thấy câu hỏi'
            console.error('Error fetching question:', err)
            set({ error: errorMessage, isLoading: false })
            return null
        }
    },

    createQuestion: async (data: any) => {
        set({ isLoading: true, error: null })
        try {
            const response = await questionService.createQuestion(data)
            let newQuestion: Question
            if (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'id' in response.data) {
                newQuestion = response.data as Question
            } else {
                newQuestion = response as Question
            }
            set((state) => ({
                questions: [...state.questions, newQuestion],
                isLoading: false
            }))
            return newQuestion
        } catch (err: any) {
            const errorMessage = err.message || 'Tạo câu hỏi thất bại'
            console.error('Error creating question:', err)
            set({ error: errorMessage, isLoading: false })
            return null
        }
    },

    updateQuestion: async (id: number, data: any) => {
        set({ isLoading: true, error: null })
        try {
            await questionService.updateQuestion(id, data)
            set((state) => ({
                questions: state.questions.map((question) =>
                    question.id === id ? { ...question, ...data } : question
                ),
                isLoading: false
            }))
        } catch (err: any) {
            const errorMessage = err.message || 'Cập nhật câu hỏi thất bại'
            console.error('Error updating question:', err)
            set({ error: errorMessage, isLoading: false })
        }
    },

    deleteQuestion: async (id: number) => {
        set({ isLoading: true, error: null })
        try {
            await questionService.deleteQuestion(id)
            set((state) => ({
                questions: state.questions.filter((question) => question.id !== id),
                isLoading: false
            }))
        } catch (err: any) {
            const errorMessage = err.message || 'Xóa câu hỏi thất bại'
            console.error('Error deleting question:', err)
            set({ error: errorMessage, isLoading: false })
        }
    },

    clearError: () => {
        set({ error: null })
    }
}))
