"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Download, FileText, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/analytics/StatCard"
import { useAnalyticsStore } from "@/store/useAnalyticsStore"
import { toast } from "sonner"
import { Target, TrendingUp, HelpCircle, BarChart3 } from "lucide-react"

export default function QuestionAnalysisPage() {
    const router = useRouter()
    const params = useParams()
    const questionId = parseInt(params.id as string)
    
    const {
        questionAnalysis,
        isLoadingQuestionAnalysis,
        questionAnalysisError,
        fetchQuestionAnalysis
    } = useAnalyticsStore()

    useEffect(() => {
        if (questionId) {
            fetchQuestionAnalysis(questionId)
        }
    }, [questionId, fetchQuestionAnalysis])

    useEffect(() => {
        if (questionAnalysisError) {
            toast.error(questionAnalysisError)
        }
    }, [questionAnalysisError])

    if (isLoadingQuestionAnalysis) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B59CE] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải phân tích...</p>
                </div>
            </div>
        )
    }

    if (!questionAnalysis) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </Button>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <p className="text-gray-600">Không tìm thấy dữ liệu cho câu hỏi này</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const getDifficultyColor = (level: string) => {
        switch (level) {
            case "Very Easy":
            case "Easy":
                return "bg-green-100 text-green-800"
            case "Medium":
                return "bg-yellow-100 text-yellow-800"
            case "Hard":
            case "Very Hard":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getQualityColor = (quality: string) => {
        if (quality.includes("Excellent")) return "bg-green-100 text-green-800"
        if (quality.includes("Good")) return "bg-blue-100 text-blue-800"
        if (quality.includes("Fair")) return "bg-yellow-100 text-yellow-800"
        return "bg-red-100 text-red-800"
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => router.back()} className="mb-2">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Phân Tích Câu Hỏi #{questionAnalysis.question_id}</h1>
                    <p className="text-gray-600 mt-2">Đánh giá chất lượng và hiệu quả câu hỏi</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        title="Tổng Số Lần Làm"
                        value={questionAnalysis.total_attempts}
                        icon={BarChart3}
                        description="Total attempts"
                    />
                    <StatCard
                        title="Tỷ Lệ Đúng"
                        value={`${questionAnalysis.correct_rate}%`}
                        icon={CheckCircle}
                        description={`${questionAnalysis.correct_attempts} đúng / ${questionAnalysis.wrong_attempts} sai`}
                    />
                    <StatCard
                        title="Độ Khó"
                        value={questionAnalysis.difficulty.toFixed(2)}
                        icon={Target}
                        description={questionAnalysis.difficulty_level}
                    />
                    <StatCard
                        title="Độ Phân Biệt"
                        value={questionAnalysis.discrimination.toFixed(2)}
                        icon={TrendingUp}
                        description="Discrimination index"
                    />
                </div>

                {/* Quality Assessment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Độ Khó</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Mức Độ</p>
                                    <Badge className={getDifficultyColor(questionAnalysis.difficulty_level)}>
                                        {questionAnalysis.difficulty_level}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Chỉ Số</p>
                                    <p className="text-2xl font-bold">{questionAnalysis.difficulty.toFixed(2)}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {questionAnalysis.difficulty < 0.3 
                                            ? "Câu hỏi dễ - nhiều học sinh làm đúng"
                                            : questionAnalysis.difficulty < 0.7
                                            ? "Câu hỏi vừa phải"
                                            : "Câu hỏi khó - ít học sinh làm đúng"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Đánh Giá Chất Lượng</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Kết Quả</p>
                                    <Badge className={getQualityColor(questionAnalysis.quality)}>
                                        {questionAnalysis.quality}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Độ Phân Biệt</p>
                                    <p className="text-2xl font-bold">{questionAnalysis.discrimination.toFixed(2)}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {questionAnalysis.discrimination > 0.4
                                            ? "Câu hỏi phân biệt tốt giữa học sinh giỏi và yếu"
                                            : questionAnalysis.discrimination > 0.2
                                            ? "Câu hỏi có khả năng phân biệt trung bình"
                                            : "Câu hỏi cần được xem xét lại"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recommendations */}
                <Card>
                    <CardHeader>
                        <CardTitle>Khuyến Nghị</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {questionAnalysis.quality.includes("Poor") && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-800">
                                        <strong>⚠️ Cần xem xét:</strong> Câu hỏi này có chất lượng thấp. 
                                        Nên xem xét chỉnh sửa hoặc thay thế để cải thiện khả năng đánh giá.
                                    </p>
                                </div>
                            )}
                            {questionAnalysis.difficulty > 0.8 && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        <strong>💡 Gợi ý:</strong> Câu hỏi quá khó. Có thể cần điều chỉnh để phù hợp hơn với trình độ học sinh.
                                    </p>
                                </div>
                            )}
                            {questionAnalysis.difficulty < 0.2 && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        <strong>💡 Gợi ý:</strong> Câu hỏi quá dễ. Có thể không phù hợp để đánh giá kiến thức.
                                    </p>
                                </div>
                            )}
                            {questionAnalysis.quality.includes("Excellent") && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-800">
                                        <strong>✅ Tuyệt vời:</strong> Câu hỏi có chất lượng tốt và phù hợp để sử dụng.
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

