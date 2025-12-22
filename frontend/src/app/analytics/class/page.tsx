"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ClassReportSelectionPage() {
    const router = useRouter()
    const [classId, setClassId] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (classId) {
            router.push(`/analytics/class/${classId}`)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>Báo Cáo Lớp Học</CardTitle>
                        <CardDescription>
                            Nhập ID của lớp học để xem thống kê lớp
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="classId">Class ID</Label>
                                <Input
                                    id="classId"
                                    type="number"
                                    placeholder="Ví dụ: 1, 2, 3..."
                                    value={classId}
                                    onChange={(e) => setClassId(e.target.value)}
                                    required
                                    className="mt-2"
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Search className="mr-2 h-4 w-4" />
                                Xem Báo Cáo
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

