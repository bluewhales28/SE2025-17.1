import { Quiz } from "@/store/useQuizStore"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/api/v1"
const QUIZ_API_URL = `${API_BASE_URL}/quizzes`
const QUESTION_API_URL = `${API_BASE_URL}/questions`

export interface ApiResponse<T = any> {
    data?: T
    message?: string
    error?: string
}

export interface CreateQuizRequest {
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
}

export interface CreateQuestionRequest {
    content: string
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY'
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    points: number
    tags: string[]
    quizId: number
    answers: {
        content: string
        isCorrect: boolean
    }[]
}

export const quizService = {
    async getPublicQuizzes(): Promise<Quiz[]> {
        const response = await fetch(QUIZ_API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`)
        }

        if (!response.ok) {
            const result = await response.json()
            throw new Error(result.message || "Không thể tải danh sách quiz")
        }

        const data = await response.json()
        return data || []
    },

    async getQuizById(id: number): Promise<Quiz> {
        const response = await fetch(`${QUIZ_API_URL}/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`)
        }

        const result = await response.json()

        if (!response.ok) {
            throw new Error(result.message || "Không tìm thấy quiz")
        }

        return result
    },

    async createQuiz(data: CreateQuizRequest): Promise<ApiResponse<Quiz>> {
        const response = await fetch(QUIZ_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`)
        }

        const result = await response.json()

        if (!response.ok) {
            throw new Error(result.message || "Tạo quiz thất bại")
        }

        return result
    },

    async updateQuiz(id: number, data: Partial<CreateQuizRequest>): Promise<ApiResponse<Quiz>> {
        const response = await fetch(`${QUIZ_API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`)
        }

        const result = await response.json()

        if (!response.ok) {
            throw new Error(result.message || "Cập nhật quiz thất bại")
        }

        return result
    },

    async deleteQuiz(id: number): Promise<ApiResponse<void>> {
        const response = await fetch(`${QUIZ_API_URL}/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        })

        if (!response.ok) {
            const result = await response.json()
            throw new Error(result.message || "Xóa quiz thất bại")
        }

        return { message: "Xóa quiz thành công" }
    },

    async createQuestion(data: CreateQuestionRequest): Promise<ApiResponse<any>> {
        const response = await fetch(QUESTION_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`)
        }

        const result = await response.json()

        if (!response.ok) {
            throw new Error(result.message || "Tạo câu hỏi thất bại")
        }

        return result
    },
}
