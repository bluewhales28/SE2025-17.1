const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1"
const ANALYTICS_API_URL = `${API_BASE_URL}/report`

// No authentication required - public access
const getAuthHeaders = () => {
    return {
        "Content-Type": "application/json"
    }
}

export interface QuizReport {
    quiz_id: number
    attempts: number
    avg_score: number
    median_score: number
    max_score: number
    min_score: number
    std_dev: number
    percentiles: {
        p25: number
        p50: number
        p75: number
        p90: number
    }
    histogram: {
        bins: number[]
        frequencies: number[]
    }
    by_topic: Record<string, number>
    by_difficulty: Record<string, number>
}

export interface StudentReport {
    student_id: number
    completed_quizzes: number
    total_attempts: number
    avg_score: number
    median_score: number
    highest_score: number
    lowest_score: number
    completion_rate: number
    topic_performance: Record<string, number>
    weak_topics: string[]
    progress_trend: number[]
}

export interface ClassReport {
    class_id: number
    total_students: number
    total_attempts: number
    avg_score: number
    median_score: number
    completion_rate: number
    top_students: Array<{
        user_id: number
        avg_score: number
        attempts: number
        consistency: number
    }>
    topic_performance: Record<string, number>
}

export interface QuestionAnalysis {
    question_id: number
    total_attempts: number
    correct_attempts: number
    wrong_attempts: number
    correct_rate: number
    difficulty: number
    discrimination: number
    difficulty_level: string
    quality: string
}

export interface CrossComparison {
    student_id: number
    student_avg: number
    class_avg: number | null
    system_avg: number
    vs_class: number | null
    vs_system: number
    percentile_vs_class: number | null
}

export const analyticsService = {
    async getQuizReport(quizId: number): Promise<QuizReport> {
        const response = await fetch(`${ANALYTICS_API_URL}/quiz/${quizId}`, {
            method: "GET",
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            const result = await response.json()
            throw new Error(result.message || "Không thể tải báo cáo quiz")
        }

        return response.json()
    },

    async getStudentReport(studentId: number): Promise<StudentReport> {
        const response = await fetch(`${ANALYTICS_API_URL}/student/${studentId}`, {
            method: "GET",
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            const result = await response.json()
            throw new Error(result.message || "Không thể tải báo cáo học sinh")
        }

        return response.json()
    },

    async getClassReport(classId: number): Promise<ClassReport> {
        const response = await fetch(`${ANALYTICS_API_URL}/class/${classId}`, {
            method: "GET",
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            const result = await response.json()
            throw new Error(result.message || "Không thể tải báo cáo lớp học")
        }

        return response.json()
    },

    async getQuestionAnalysis(questionId: number): Promise<QuestionAnalysis> {
        const response = await fetch(`${ANALYTICS_API_URL}/question/${questionId}`, {
            method: "GET",
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            const result = await response.json()
            throw new Error(result.message || "Không thể tải phân tích câu hỏi")
        }

        return response.json()
    },

    async getCrossComparison(studentId: number, classId?: number): Promise<CrossComparison> {
        const url = new URL(`${ANALYTICS_API_URL}/compare/${studentId}`)
        if (classId) {
            url.searchParams.append('class_id', classId.toString())
        }

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            const result = await response.json()
            throw new Error(result.message || "Không thể tải so sánh")
        }

        return response.json()
    },

    async exportCSV(params?: {
        quiz_id?: number
        class_id?: number
        user_id?: number
        start_date?: string
        end_date?: string
    }): Promise<Blob> {
        const url = new URL(`${ANALYTICS_API_URL}/export/csv`)
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    url.searchParams.append(key, value.toString())
                }
            })
        }

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            const result = await response.json()
            throw new Error(result.message || "Không thể xuất CSV")
        }

        return response.blob()
    },

    async exportPDF(params?: {
        quiz_id?: number
        class_id?: number
        report_type?: 'quiz' | 'class' | 'all'
    }): Promise<Blob> {
        const url = new URL(`${ANALYTICS_API_URL}/export/pdf`)
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    url.searchParams.append(key, value.toString())
                }
            })
        }

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            const result = await response.json()
            throw new Error(result.message || "Không thể xuất PDF")
        }

        return response.blob()
    },

    async generateCertificate(studentId: number, quizId: number, sendEmail: boolean = false): Promise<any> {
        const url = new URL(`${ANALYTICS_API_URL}/certificate/generate`)
        url.searchParams.append('student_id', studentId.toString())
        url.searchParams.append('quiz_id', quizId.toString())
        url.searchParams.append('send_email', sendEmail.toString())

        const response = await fetch(url.toString(), {
            method: "POST",
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            const result = await response.json()
            throw new Error(result.message || "Không thể tạo chứng chỉ")
        }

        return response.json()
    }
}

