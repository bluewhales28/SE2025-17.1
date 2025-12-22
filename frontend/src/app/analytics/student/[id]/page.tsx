"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Download, FileText, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/analytics/StatCard"
import { ProgressTrendChart } from "@/components/analytics/ProgressTrendChart"
import { TopicPerformanceChart } from "@/components/analytics/TopicPerformanceChart"
import { useAnalyticsStore } from "@/store/useAnalyticsStore"
import { toast } from "sonner"
import { TrendingUp, Target, Award, BookOpen } from "lucide-react"

export default function StudentReportPage() {
    const router = useRouter()
    const params = useParams()
    const studentId = parseInt(params.id as string)
    
    const {
        studentReport,
        isLoadingStudentReport,
        studentReportError,
        fetchStudentReport,
        exportPDF,
        exportCSV
    } = useAnalyticsStore()

    useEffect(() => {
        if (studentId) {
            fetchStudentReport(studentId)
        }
    }, [studentId, fetchStudentReport])

    useEffect(() => {
        if (studentReportError) {
            toast.error(studentReportError)
        }
    }, [studentReportError])

    const handleExportPDF = async () => {
        try {
            await exportPDF({ user_id: studentId, report_type: 'quiz' })
            toast.success("Đã xuất PDF thành công!")
        } catch (error: any) {
            toast.error(error.message || "Xuất PDF thất bại")
        }
    }

    const handleExportCSV = async () => {
        try {
            await exportCSV({ user_id: studentId })
            toast.success("Đã xuất CSV thành công!")
        } catch (error: any) {
            toast.error(error.message || "Xuất CSV thất bại")
        }
    }

    if (isLoadingStudentReport) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B59CE] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải báo cáo...</p>
                </div>
            </div>
        )
    }

    if (!studentReport) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </Button>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <p className="text-gray-600">Không tìm thấy dữ liệu cho học sinh này</p>
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
                        <h1 className="text-3xl font-bold text-gray-900">Báo Cáo Học Sinh #{studentReport.student_id}</h1>
                        <p className="text-gray-600 mt-2">Theo dõi tiến độ và hiệu suất</p>
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
                        title="Quiz Đã Hoàn Thành"
                        value={studentReport.completed_quizzes}
                        icon={BookOpen}
                        description={`${studentReport.total_attempts} lần làm bài`}
                    />
                    <StatCard
                        title="Điểm Trung Bình"
                        value={`${studentReport.avg_score}%`}
                        icon={TrendingUp}
                        description={`Median: ${studentReport.median_score}%`}
                    />
                    <StatCard
                        title="Điểm Cao Nhất"
                        value={`${studentReport.highest_score}%`}
                        icon={Award}
                        description={`Điểm thấp nhất: ${studentReport.lowest_score}%`}
                    />
                    <StatCard
                        title="Tỷ Lệ Hoàn Thành"
                        value={`${studentReport.completion_rate}%`}
                        icon={Target}
                        description="Completion rate"
                    />
                </div>

                {/* Weak Topics */}
                {studentReport.weak_topics.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                                Điểm Yếu Cần Cải Thiện
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {studentReport.weak_topics.map((topic, index) => (
                                    <Badge key={index} variant="destructive" className="text-sm">
                                        {topic}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Progress Trend */}
                {studentReport.progress_trend.length > 0 && (
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <ProgressTrendChart 
                                data={studentReport.progress_trend}
                                title="Xu Hướng Tiến Bộ"
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Topic Performance */}
                {Object.keys(studentReport.topic_performance).length > 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <TopicPerformanceChart 
                                data={studentReport.topic_performance}
                                title="Hiệu Suất Theo Chủ Đề"
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

