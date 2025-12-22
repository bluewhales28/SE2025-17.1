"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BarChart3, FileText, Users, HelpCircle, Download, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/useAuthStore"
import { toast } from "sonner"

export default function AnalyticsPage() {
    const router = useRouter()

    const analyticsOptions = [
        {
            title: "Báo Cáo Quiz",
            description: "Xem thống kê chi tiết về quiz, điểm số, phân bố, và phân tích theo chủ đề",
            icon: FileText,
            href: "/analytics/quiz",
            color: "bg-blue-500"
        },
        {
            title: "Báo Cáo Học Sinh",
            description: "Theo dõi tiến độ học sinh, điểm yếu, và xu hướng cải thiện",
            icon: Users,
            href: "/analytics/student",
            color: "bg-green-500"
        },
        {
            title: "Báo Cáo Lớp Học",
            description: "Thống kê lớp học, top học sinh, và tỷ lệ hoàn thành",
            icon: BarChart3,
            href: "/analytics/class",
            color: "bg-purple-500"
        },
        {
            title: "Phân Tích Câu Hỏi",
            description: "Đánh giá chất lượng câu hỏi, độ khó, và khả năng phân biệt",
            icon: HelpCircle,
            href: "/analytics/question",
            color: "bg-orange-500"
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
                    <p className="text-gray-600 mt-2">Phân tích dữ liệu và tạo báo cáo chi tiết</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analyticsOptions.map((option, index) => {
                        const Icon = option.icon
                        return (
                            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-center space-x-4">
                                        <div className={`${option.color} p-3 rounded-lg`}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle>{option.title}</CardTitle>
                                            <CardDescription className="mt-2">
                                                {option.description}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Link href={option.href}>
                                        <Button className="w-full">
                                            Xem Báo Cáo
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Xuất Báo Cáo</CardTitle>
                        <CardDescription>
                            Tải xuống báo cáo dưới dạng PDF hoặc CSV
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex space-x-4">
                        <Button variant="outline" className="flex-1">
                            <Download className="mr-2 h-4 w-4" />
                            Xuất PDF
                        </Button>
                        <Button variant="outline" className="flex-1">
                            <Download className="mr-2 h-4 w-4" />
                            Xuất CSV
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

