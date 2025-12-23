"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Clock, Target, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useQuizStore } from "@/store/useQuizStore"
import { useQuestionStore } from "@/store/useQuestionStore"
import { toast } from "sonner"

export default function QuizPage() {
    const router = useRouter()
    const params = useParams()
    const quizId = parseInt(params.id as string)

    const { getQuizById } = useQuizStore()
    const { questions, fetchQuestions } = useQuestionStore()

    const [quiz, setQuiz] = useState<any>(null)
    const [quizQuestions, setQuizQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<{ [key: number]: any }>({})
    const [timeLeft, setTimeLeft] = useState(0)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [score, setScore] = useState(0)

    useEffect(() => {
        loadQuizData()
    }, [quizId])

    useEffect(() => {
        if (quiz && !isSubmitted && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleSubmit()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [quiz, timeLeft, isSubmitted])

    const loadQuizData = async () => {
        setLoading(true)
        try {
            const quizData = await getQuizById(quizId)
            if (!quizData) {
                toast.error("Không tìm thấy quiz")
                router.push("/latest")
                return
            }
            setQuiz(quizData)
            setTimeLeft(quizData.timeLimit * 60) // Convert to seconds

            await fetchQuestions()
        } catch (err: any) {
            toast.error(err.message || "Không thể tải quiz")
            router.push("/latest")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (Array.isArray(questions) && questions.length > 0 && quiz) {
            const filtered = questions.filter(q => q.quizId === quizId)
            setQuizQuestions(filtered)
        }
    }, [questions, quiz, quizId])

    const handleAnswerSelect = (questionId: number, answerId: number) => {
        if (isSubmitted) return
        setAnswers({ ...answers, [questionId]: answerId })
    }

    const handleMultipleAnswerSelect = (questionId: number, answerId: number) => {
        if (isSubmitted) return
        const currentAnswers = answers[questionId] || []
        const newAnswers = currentAnswers.includes(answerId)
            ? currentAnswers.filter((id: number) => id !== answerId)
            : [...currentAnswers, answerId]
        setAnswers({ ...answers, [questionId]: newAnswers })
    }

    const calculateScore = () => {
        let totalScore = 0
        quizQuestions.forEach(question => {
            const userAnswer = answers[question.id]
            if (!userAnswer) return

            const correctAnswers = question.answers.filter((a: any) => a.isCorrect)

            if (question.type === 'MULTIPLE_CHOICE') {
                if (Array.isArray(userAnswer)) {
                    // Multiple correct answers
                    const correctIds = correctAnswers.map((a: any) => a.id)
                    const isCorrect = userAnswer.length === correctIds.length &&
                        userAnswer.every((id: number) => correctIds.includes(id))
                    if (isCorrect) totalScore += question.points
                } else {
                    // Single answer
                    const isCorrect = correctAnswers.some((a: any) => a.id === userAnswer)
                    if (isCorrect) totalScore += question.points
                }
            } else if (question.type === 'TRUE_FALSE') {
                const isCorrect = correctAnswers.some((a: any) => a.id === userAnswer)
                if (isCorrect) totalScore += question.points
            }
        })
        return totalScore
    }

    const handleSubmit = () => {
        const finalScore = calculateScore()
        setScore(finalScore)
        setIsSubmitted(true)

        // Save to localStorage
        const completedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes') || '[]')
        const quizResult = {
            quizId: quiz.id,
            quizTitle: quiz.title,
            quizDifficulty: quiz.difficulty,
            score: finalScore,
            totalPoints: quiz.totalPoints,
            completedAt: new Date().toISOString(),
            timeLeft: timeLeft
        }

        // Remove old attempt if exists
        const filtered = completedQuizzes.filter((q: any) => q.quizId !== quiz.id)
        filtered.unshift(quizResult)
        localStorage.setItem('completedQuizzes', JSON.stringify(filtered))

        toast.success(`Bạn đã hoàn thành bài thi! Điểm số: ${finalScore}/${quiz.totalPoints}`)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'EASY': return 'bg-green-100 text-green-700'
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-700'
            case 'HARD': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B59CE]"></div>
            </div>
        )
    }

    if (!quiz || quizQuestions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="pt-6">
                        <p className="text-center text-gray-600 mb-4">Quiz này chưa có câu hỏi nào</p>
                        <Button onClick={() => router.push("/latest")} className="w-full">
                            Quay lại
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const currentQuestion = quizQuestions[currentQuestionIndex]

    const calculateCurrentScore = () => {
        let currentScore = 0
        quizQuestions.forEach(question => {
            const userAnswer = answers[question.id]
            if (!userAnswer) return

            const correctAnswers = question.answers.filter((a: any) => a.isCorrect)

            if (question.type === 'MULTIPLE_CHOICE') {
                if (Array.isArray(userAnswer)) {
                    const correctIds = correctAnswers.map((a: any) => a.id)
                    const isCorrect = userAnswer.length === correctIds.length &&
                        userAnswer.every((id: number) => correctIds.includes(id))
                    if (isCorrect) currentScore += question.points
                } else {
                    const isCorrect = correctAnswers.some((a: any) => a.id === userAnswer)
                    if (isCorrect) currentScore += question.points
                }
            } else if (question.type === 'TRUE_FALSE') {
                const isCorrect = correctAnswers.some((a: any) => a.id === userAnswer)
                if (isCorrect) currentScore += question.points
            }
        })
        return currentScore
    }

    const currentScore = calculateCurrentScore()
    const progressPercentage = quiz ? (currentScore / quiz.totalPoints) * 100 : 0

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/latest")}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại
                        </Button>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className={`h-4 w-4 ${timeLeft < 60 ? 'text-red-600' : 'text-gray-600'}`} />
                                <span className={timeLeft < 60 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <Target className="h-4 w-4 text-[#6B59CE]" />
                                <span className="font-semibold">{isSubmitted ? score : currentScore}/{quiz.totalPoints}</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="pb-4 px-4">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-[#6B59CE] bg-[#6B59CE] text-white rounded-full w-8 h-8 flex items-center justify-center">
                                        {isSubmitted ? score : currentScore}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-500 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center">
                                        {quiz.totalPoints}
                                    </span>
                                </div>
                                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#6B59CE] to-[#8B7CE8] transition-all duration-500 ease-out"
                                        style={{ width: `${isSubmitted ? (score / quiz.totalPoints) * 100 : progressPercentage}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                                    </div>
                                    {/* Segments */}
                                    <div className="absolute inset-0 flex">
                                        {Array.from({ length: quizQuestions.length }).map((_, index) => (
                                            <div
                                                key={index}
                                                className="flex-1 border-r border-white/30"
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Quiz Info */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <CardTitle className="text-2xl mb-2">{quiz.title}</CardTitle>
                                {quiz.description && (
                                    <CardDescription>{quiz.description}</CardDescription>
                                )}
                            </div>
                            <Badge className={getDifficultyColor(quiz.difficulty)}>
                                {quiz.difficulty}
                            </Badge>
                        </div>
                    </CardHeader>
                </Card>

                {/* Question Navigation */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                            Câu hỏi {currentQuestionIndex + 1}/{quizQuestions.length}
                        </h3>
                        <div className="flex gap-2">
                            {quizQuestions.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentQuestionIndex(index)}
                                    className={`w-10 h-10 rounded-full font-medium transition-colors ${index === currentQuestionIndex
                                        ? 'bg-[#6B59CE] text-white'
                                        : answers[quizQuestions[index].id]
                                            ? 'bg-green-100 text-green-700 border-2 border-green-500'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Current Question */}
                {currentQuestion && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <CardTitle className="text-lg flex-1">
                                    {currentQuestion.content}
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Badge variant="outline">{currentQuestion.points} điểm</Badge>
                                    <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                                        {currentQuestion.difficulty}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {currentQuestion.type === 'ESSAY' ? (
                                <textarea
                                    className="w-full min-h-[200px] p-3 border rounded-lg"
                                    placeholder="Nhập câu trả lời của bạn..."
                                    disabled={isSubmitted}
                                    value={answers[currentQuestion.id] || ''}
                                    onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                                />
                            ) : (
                                <div className="space-y-2">
                                    {currentQuestion.answers && currentQuestion.answers.map((answer: any) => {
                                        const isSelected = Array.isArray(answers[currentQuestion.id])
                                            ? answers[currentQuestion.id].includes(answer.id)
                                            : answers[currentQuestion.id] === answer.id

                                        const showResult = isSubmitted
                                        const isCorrect = answer.isCorrect

                                        return (
                                            <button
                                                key={answer.id}
                                                onClick={() => {
                                                    if (currentQuestion.type === 'MULTIPLE_CHOICE' &&
                                                        currentQuestion.answers.filter((a: any) => a.isCorrect).length > 1) {
                                                        handleMultipleAnswerSelect(currentQuestion.id, answer.id)
                                                    } else {
                                                        handleAnswerSelect(currentQuestion.id, answer.id)
                                                    }
                                                }}
                                                disabled={isSubmitted}
                                                className={`w-full p-4 text-left border-2 rounded-lg transition-all ${showResult
                                                    ? isCorrect
                                                        ? 'border-green-500 bg-green-50'
                                                        : isSelected
                                                            ? 'border-red-500 bg-red-50'
                                                            : 'border-gray-200 bg-white'
                                                    : isSelected
                                                        ? 'border-[#6B59CE] bg-purple-50'
                                                        : 'border-gray-200 bg-white hover:border-[#6B59CE]'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${showResult
                                                        ? isCorrect
                                                            ? 'border-green-500 bg-green-500'
                                                            : isSelected
                                                                ? 'border-red-500 bg-red-500'
                                                                : 'border-gray-300'
                                                        : isSelected
                                                            ? 'border-[#6B59CE] bg-[#6B59CE]'
                                                            : 'border-gray-300'
                                                        }`}>
                                                        {isSelected && !showResult && (
                                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                                        )}
                                                        {showResult && isCorrect && (
                                                            <CheckCircle className="w-4 h-4 text-white" />
                                                        )}
                                                        {showResult && isSelected && !isCorrect && (
                                                            <XCircle className="w-4 h-4 text-white" />
                                                        )}
                                                    </div>
                                                    <span className={showResult && isCorrect ? 'font-medium' : ''}>
                                                        {answer.content}
                                                    </span>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-6">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                    >
                        Câu trước
                    </Button>

                    {!isSubmitted ? (
                        currentQuestionIndex === quizQuestions.length - 1 ? (
                            <Button
                                onClick={handleSubmit}
                                className="bg-[#6B59CE] hover:bg-[#5a4ab8]"
                            >
                                Nộp bài
                            </Button>
                        ) : (
                            <Button
                                onClick={() => setCurrentQuestionIndex(prev => Math.min(quizQuestions.length - 1, prev + 1))}
                            >
                                Câu tiếp theo
                            </Button>
                        )
                    ) : (
                        <Button
                            onClick={() => router.push("/latest")}
                            className="bg-[#6B59CE] hover:bg-[#5a4ab8]"
                        >
                            Hoàn thành
                        </Button>
                    )}
                </div>

                {/* Result Summary */}
                {isSubmitted && (
                    <Card className="mt-6 border-[#6B59CE]">
                        <CardHeader>
                            <CardTitle className="text-center">Kết quả</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center space-y-4">
                                <div>
                                    <p className="text-4xl font-bold text-[#6B59CE]">
                                        {score}/{quiz.totalPoints}
                                    </p>
                                    <p className="text-gray-600 mt-2">
                                        {((score / quiz.totalPoints) * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                    <div>
                                        <p className="text-sm text-gray-600">Tổng câu hỏi</p>
                                        <p className="text-xl font-semibold">{quizQuestions.length}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Đã trả lời</p>
                                        <p className="text-xl font-semibold">{Object.keys(answers).length}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Thời gian còn</p>
                                        <p className="text-xl font-semibold">{formatTime(timeLeft)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    )
}
