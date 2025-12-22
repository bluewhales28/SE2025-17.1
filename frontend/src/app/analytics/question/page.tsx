"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function QuestionAnalysisSelectionPage() {
    const router = useRouter()
    const [questionId, setQuestionId] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (questionId) {
            router.push(`/analytics/question/${questionId}`)
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
                        <CardTitle>Phân Tích Câu Hỏi</CardTitle>
                        <CardDescription>
                            Nhập ID của câu hỏi để xem phân tích chất lượng
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="questionId">Question ID</Label>
                                <Input
                                    id="questionId"
                                    type="number"
                                    placeholder="Ví dụ: 1, 2, 3..."
                                    value={questionId}
                                    onChange={(e) => setQuestionId(e.target.value)}
                                    required
                                    className="mt-2"
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Search className="mr-2 h-4 w-4" />
                                Xem Phân Tích
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

