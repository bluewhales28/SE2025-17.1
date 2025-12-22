"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Download, FileText, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/analytics/StatCard"
import { TopicPerformanceChart } from "@/components/analytics/TopicPerformanceChart"
import { useAnalyticsStore } from "@/store/useAnalyticsStore"
import { toast } from "sonner"
import { TrendingUp, Users, Target, Award } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function ClassReportPage() {
    const router = useRouter()
    const params = useParams()
    const classId = parseInt(params.id as string)
    
    const {
        classReport,
        isLoadingClassReport,
        classReportError,
        fetchClassReport,
        exportPDF,
        exportCSV
    } = useAnalyticsStore()

    useEffect(() => {
        if (classId) {
            fetchClassReport(classId)
        }
    }, [classId, fetchClassReport])

    useEffect(() => {
        if (classReportError) {
            toast.error(classReportError)
        }
    }, [classReportError])

    const handleExportPDF = async () => {
        try {
            await exportPDF({ class_id: classId, report_type: 'class' })
            toast.success("Đã xuất PDF thành công!")
        } catch (error: any) {
            toast.error(error.message || "Xuất PDF thất bại")
        }
    }

    const handleExportCSV = async () => {
        try {
            await exportCSV({ class_id: classId })
            toast.success("Đã xuất CSV thành công!")
        } catch (error: any) {
            toast.error(error.message || "Xuất CSV thất bại")
        }
    }

    if (isLoadingClassReport) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B59CE] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải báo cáo...</p>
                </div>
            </div>
        )
    }

    if (!classReport) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </Button>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <p className="text-gray-600">Không tìm thấy dữ liệu cho lớp học này</p>
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
                        <h1 className="text-3xl font-bold text-gray-900">Báo Cáo Lớp Học #{classReport.class_id}</h1>
                        <p className="text-gray-600 mt-2">Thống kê và phân tích lớp học</p>
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
                        title="Tổng Số Học Sinh"
                        value={classReport.total_students}
                        icon={Users}
                        description={`${classReport.total_attempts} lần làm bài`}
                    />
                    <StatCard
                        title="Điểm Trung Bình Lớp"
                        value={`${classReport.avg_score}%`}
                        icon={TrendingUp}
                        description={`Median: ${classReport.median_score}%`}
                    />
                    <StatCard
                        title="Tỷ Lệ Hoàn Thành"
                        value={`${classReport.completion_rate}%`}
                        icon={Target}
                        description="Completion rate"
                    />
                    <StatCard
                        title="Top Học Sinh"
                        value={classReport.top_students.length}
                        icon={Trophy}
                        description="Students in top list"
                    />
                </div>

                {/* Top Students Table */}
                {classReport.top_students.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                                Top Học Sinh
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Hạng</TableHead>
                                        <TableHead>Học Sinh</TableHead>
                                        <TableHead>Điểm Trung Bình</TableHead>
                                        <TableHead>Số Lần Làm</TableHead>
                                        <TableHead>Độ Ổn Định</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {classReport.top_students.map((student, index) => (
                                        <TableRow key={student.user_id}>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    {index === 0 && <Trophy className="h-4 w-4 text-yellow-500 mr-2" />}
                                                    <span className="font-bold">#{index + 1}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Avatar>
                                                        <AvatarFallback>HS{student.user_id}</AvatarFallback>
                                                    </Avatar>
                                                    <span>Học Sinh #{student.user_id}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold">{student.avg_score}%</TableCell>
                                            <TableCell>{student.attempts}</TableCell>
                                            <TableCell>{student.consistency}%</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Topic Performance */}
                {Object.keys(classReport.topic_performance).length > 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <TopicPerformanceChart 
                                data={classReport.topic_performance}
                                title="Hiệu Suất Theo Chủ Đề"
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

