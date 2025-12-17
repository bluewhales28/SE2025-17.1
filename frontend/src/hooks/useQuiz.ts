import { useState, useEffect, useCallback } from "react"

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

export const useQuiz = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchQuizzes = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch('http://localhost/api/v1/quizzes')

            if (!response.ok) {
                throw new Error('Failed to fetch quizzes')
            }

            const data = await response.json()
            setQuizzes(data || [])
        } catch (err: any) {
            const errorMessage = err.message || "Không thể tải danh sách quiz"
            setError(errorMessage)
            console.error('Error fetching quizzes:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const addQuiz = useCallback((quiz: Quiz) => {
        setQuizzes((prev) => [...prev, quiz])
    }, [])

    const updateQuiz = useCallback((id: number, updatedQuiz: Partial<Quiz>) => {
        setQuizzes((prev) =>
            prev.map((quiz) =>
                quiz.id === id ? { ...quiz, ...updatedQuiz } : quiz
            )
        )
    }, [])

    const deleteQuiz = useCallback((id: number) => {
        setQuizzes((prev) => prev.filter((quiz) => quiz.id !== id))
    }, [])

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    return {
        quizzes,
        isLoading,
        error,
        fetchQuizzes,
        addQuiz,
        updateQuiz,
        deleteQuiz,
        clearError,
    }
}
