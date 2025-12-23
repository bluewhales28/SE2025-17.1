"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, Trash2, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useQuestionStore } from "@/store/useQuestionStore"
import { toast } from "sonner"

export default function QuestionDetailPage() {
    const router = useRouter()
    const params = useParams()
    const questionId = parseInt(params.id as string)

    const { getQuestionById, deleteQuestion, isLoading } = useQuestionStore()
    const [question, setQuestion] = useState<any>(null)

    useEffect(() => {
        const loadQuestion = async () => {
            try {
                const data = await getQuestionById(questionId)
                setQuestion(data)
            } catch (err: any) {
                toast.error(err.message || "Không thể tải câu hỏi")
                router.push("/library")
            }
        }

        if (questionId) {
            loadQuestion()
        }
    }, [questionId, getQuestionById, router])

    const handleDelete = async () => {
        if (confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
            try {
                await deleteQuestion(questionId)
                toast.success("Xóa câu hỏi thành công!")
                router.push("/library")
            } catch (err: any) {
                toast.error(err.message || "Xóa câu hỏi thất bại")
            }
        }
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'EASY': return 'bg-green-100 text-green-700'
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-700'
            case 'HARD': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'MULTIPLE_CHOICE': return 'Trắc nghiệm'
            case 'TRUE_FALSE': return 'Đúng/Sai'
            case 'ESSAY': return 'Tự luận'
            default: return type
        }
    }

    if (isLoading || !question) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B59CE]"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link href="/library" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại thư viện
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge className={getDifficultyColor(question.difficulty)}>
                                        {question.difficulty}
                                    </Badge>
                                    <Badge variant="outline">{getTypeLabel(question.type)}</Badge>
                                </div>
                                <CardTitle className="text-2xl">Câu hỏi #{question.id}</CardTitle>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => router.push(`/question/${questionId}/edit`)}
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleDelete}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Content */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Nội dung</h3>
                            <p className="text-lg">{question.content}</p>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-500">Quiz ID</p>
                                <p className="text-lg font-medium">#{question.quizId}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Điểm</p>
                                <p className="text-lg font-medium">{question.points}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Loại câu hỏi</p>
                                <p className="text-lg font-medium">{getTypeLabel(question.type)}</p>
                            </div>
                        </div>

                        {/* Tags */}
                        {question.tags && question.tags.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {question.tags.map((tag: string, index: number) => (
                                        <Badge key={index} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Answers */}
                        {question.answers && question.answers.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3">Đáp án</h3>
                                <div className="space-y-2">
                                    {question.answers.map((answer: any, index: number) => (
                                        <div
                                            key={answer.id || index}
                                            className={`flex items-start gap-3 p-4 rounded-lg border-2 ${answer.isCorrect
                                                    ? 'bg-green-50 border-green-300'
                                                    : 'bg-gray-50 border-gray-200'
                                                }`}
                                        >
                                            <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${answer.isCorrect
                                                    ? 'bg-green-500 border-green-500'
                                                    : 'border-gray-300'
                                                }`}>
                                                {answer.isCorrect && (
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className={answer.isCorrect ? 'font-medium' : ''}>
                                                    {answer.content}
                                                </p>
                                                {answer.isCorrect && (
                                                    <p className="text-xs text-green-600 mt-1">Đáp án đúng</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Timestamps */}
                        {(question.createdAt || question.updatedAt) && (
                            <div className="pt-6 border-t">
                                <div className="flex items-center gap-6 text-sm text-gray-500">
                                    {question.createdAt && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span>Tạo: {new Date(question.createdAt).toLocaleString('vi-VN')}</span>
                                        </div>
                                    )}
                                    {question.updatedAt && question.updatedAt !== question.createdAt && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span>Cập nhật: {new Date(question.updatedAt).toLocaleString('vi-VN')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
