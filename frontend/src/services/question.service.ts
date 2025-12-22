import { Question } from "@/store/useQuestionStore"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1"
const QUESTION_API_URL = `${API_BASE_URL}/questions`

export interface ApiResponse<T = any> {
    data?: T
    message?: string
    error?: string
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

export const questionService = {
    async getQuestions(): Promise<Question[]> {
        const response = await fetch(QUESTION_API_URL, {
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
            throw new Error(result.message || "Không thể tải danh sách câu hỏi")
        }

        const data = await response.json()
        return data || []
    },

    async getQuestionById(id: number): Promise<Question> {
        const response = await fetch(`${QUESTION_API_URL}/${id}`, {
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
            throw new Error(result.message || "Không tìm thấy câu hỏi")
        }

        return result
    },

    async createQuestion(data: CreateQuestionRequest): Promise<ApiResponse<Question>> {
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

    async updateQuestion(id: number, data: Partial<CreateQuestionRequest>): Promise<ApiResponse<Question>> {
        const response = await fetch(`${QUESTION_API_URL}/${id}`, {
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
            throw new Error(result.message || "Cập nhật câu hỏi thất bại")
        }

        return result
    },

    async deleteQuestion(id: number): Promise<ApiResponse<void>> {
        const response = await fetch(`${QUESTION_API_URL}/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        })

        if (!response.ok) {
            const result = await response.json()
            throw new Error(result.message || "Xóa câu hỏi thất bại")
        }

        return { message: "Xóa câu hỏi thành công" }
    },
}
