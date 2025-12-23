"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Download, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/analytics/StatCard"
import { ScoreHistogram } from "@/components/analytics/ScoreHistogram"
import { TopicPerformanceChart } from "@/components/analytics/TopicPerformanceChart"
import { useAnalyticsStore } from "@/store/useAnalyticsStore"
import { toast } from "sonner"
import { TrendingUp, Users, Target, Award } from "lucide-react"

export default function QuizReportPage() {
    const router = useRouter()
    const params = useParams()
    const quizId = parseInt(params.id as string)
    
    const {
        quizReport,
        isLoadingQuizReport,
        quizReportError,
        fetchQuizReport,
        exportPDF,
        exportCSV
    } = useAnalyticsStore()

    useEffect(() => {
        if (quizId) {
            fetchQuizReport(quizId)
        }
    }, [quizId, fetchQuizReport])

    useEffect(() => {
        if (quizReportError) {
            toast.error(quizReportError)
        }
    }, [quizReportError])

    const handleExportPDF = async () => {
        try {
            await exportPDF({ quiz_id: quizId, report_type: 'quiz' })
            toast.success("Đã xuất PDF thành công!")
        } catch (error: any) {
            toast.error(error.message || "Xuất PDF thất bại")
        }
    }

    const handleExportCSV = async () => {
        try {
            await exportCSV({ quiz_id: quizId })
            toast.success("Đã xuất CSV thành công!")
        } catch (error: any) {
            toast.error(error.message || "Xuất CSV thất bại")
        }
    }

    if (isLoadingQuizReport) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B59CE] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải báo cáo...</p>
                </div>
            </div>
        )
    }

    if (!quizReport) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </Button>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <p className="text-gray-600">Không tìm thấy dữ liệu cho quiz này</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <Button variant="ghost" onClick={() => router.back()} className="mb-2">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900">Báo Cáo Quiz #{quizReport.quiz_id}</h1>
                        <p className="text-gray-600 mt-2">Thống kê chi tiết về quiz</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" onClick={handleExportPDF}>
                            <Download className="mr-2 h-4 w-4" />
                            PDF
                        </Button>
                        <Button variant="outline" onClick={handleExportCSV}>
                            <FileText className="mr-2 h-4 w-4" />
                            CSV
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        title="Tổng Số Lần Làm"
                        value={quizReport.attempts}
                        icon={Users}
                        description={`${quizReport.attempts} học sinh đã làm quiz này`}
                    />
                    <StatCard
                        title="Điểm Trung Bình"
                        value={`${quizReport.avg_score}%`}
                        icon={TrendingUp}
                        description={`Median: ${quizReport.median_score}%`}
                    />
                    <StatCard
                        title="Điểm Cao Nhất"
                        value={`${quizReport.max_score}%`}
                        icon={Award}
                        description={`Điểm thấp nhất: ${quizReport.min_score}%`}
                    />
                    <StatCard
                        title="Độ Lệch Chuẩn"
                        value={quizReport.std_dev.toFixed(2)}
                        icon={Target}
                        description="Standard deviation"
                    />
                </div>

                {/* Percentiles */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Percentiles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-600">25th Percentile</p>
                                <p className="text-2xl font-bold text-blue-600">{quizReport.percentiles.p25}%</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-gray-600">50th Percentile (Median)</p>
                                <p className="text-2xl font-bold text-green-600">{quizReport.percentiles.p50}%</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <p className="text-sm text-gray-600">75th Percentile</p>
                                <p className="text-2xl font-bold text-purple-600">{quizReport.percentiles.p75}%</p>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <p className="text-sm text-gray-600">90th Percentile</p>
                                <p className="text-2xl font-bold text-orange-600">{quizReport.percentiles.p90}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Histogram */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Phân Bố Điểm Số</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScoreHistogram 
                            bins={quizReport.histogram.bins}
                            frequencies={quizReport.histogram.frequencies}
                        />
                    </CardContent>
                </Card>

                {/* Topic Performance */}
                {Object.keys(quizReport.by_topic).length > 0 && (
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <TopicPerformanceChart 
                                data={quizReport.by_topic}
                                title="Hiệu Suất Theo Chủ Đề"
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Difficulty Performance */}
                {Object.keys(quizReport.by_difficulty).length > 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <TopicPerformanceChart 
                                data={quizReport.by_difficulty}
                                title="Hiệu Suất Theo Độ Khó"
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

