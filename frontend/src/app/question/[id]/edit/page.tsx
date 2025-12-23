"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useQuestionStore } from "@/store/useQuestionStore"
import { useQuizStore } from "@/store/useQuizStore"
import { toast } from "sonner"

export default function EditQuestionPage() {
    const router = useRouter()
    const params = useParams()
    const questionId = parseInt(params.id as string)

    const { getQuestionById, updateQuestion, isLoading } = useQuestionStore()
    const { quizzes, fetchQuizzes } = useQuizStore()

    const [formData, setFormData] = useState({
        content: "",
        type: "MULTIPLE_CHOICE" as "MULTIPLE_CHOICE" | "TRUE_FALSE" | "ESSAY",
        difficulty: "EASY" as "EASY" | "MEDIUM" | "HARD",
        points: 10,
        quizId: 0,
        tags: [] as string[],
    })

    const [tagInput, setTagInput] = useState("")
    const [answers, setAnswers] = useState([
        { content: "", isCorrect: false },
        { content: "", isCorrect: false },
    ])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchQuizzes()
    }, [fetchQuizzes])

    useEffect(() => {
        const loadQuestion = async () => {
            try {
                const question = await getQuestionById(questionId)
                if (!question) {
                    toast.error("Không tìm thấy câu hỏi")
                    router.push("/library")
                    return
                }
                setFormData({
                    content: question.content,
                    type: question.type,
                    difficulty: question.difficulty,
                    points: question.points,
                    quizId: question.quizId,
                    tags: question.tags || [],
                })

                if (question.answers && question.answers.length > 0) {
                    setAnswers(question.answers.map((a: any) => ({
                        content: a.content,
                        isCorrect: a.isCorrect,
                    })))
                }

                setLoading(false)
            } catch (err: any) {
                toast.error(err.message || "Không thể tải câu hỏi")
                router.push("/library")
            }
        }

        if (questionId) {
            loadQuestion()
        }
    }, [questionId, getQuestionById, router])

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
            setTagInput("")
        }
    }

    const handleRemoveTag = (tag: string) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
    }

    const handleAddAnswer = () => {
        setAnswers([...answers, { content: "", isCorrect: false }])
    }

    const handleRemoveAnswer = (index: number) => {
        if (answers.length > 2) {
            setAnswers(answers.filter((_, i) => i !== index))
        }
    }

    const handleAnswerChange = (index: number, field: string, value: any) => {
        const newAnswers = [...answers]
        newAnswers[index] = { ...newAnswers[index], [field]: value }
        setAnswers(newAnswers)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.content.trim()) {
            toast.error("Vui lòng nhập nội dung câu hỏi")
            return
        }

        if (formData.quizId === 0) {
            toast.error("Vui lòng chọn quiz")
            return
        }

        if (formData.type === "MULTIPLE_CHOICE" && answers.filter(a => a.content.trim()).length < 2) {
            toast.error("Câu hỏi trắc nghiệm phải có ít nhất 2 đáp án")
            return
        }

        if (formData.type === "MULTIPLE_CHOICE" && !answers.some(a => a.isCorrect)) {
            toast.error("Phải có ít nhất 1 đáp án đúng")
            return
        }

        try {
            const validAnswers = answers
                .filter(a => a.content.trim())
                .map(a => ({ content: a.content.trim(), isCorrect: a.isCorrect }))

            await updateQuestion(questionId, {
                ...formData,
                answers: validAnswers,
            })

            toast.success("Cập nhật câu hỏi thành công!")
            router.push("/library")
        } catch (err: any) {
            toast.error(err.message || "Cập nhật câu hỏi thất bại")
        }
    }

    if (loading) {
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
                        <CardTitle className="text-2xl">Chỉnh sửa câu hỏi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Content */}
                            <div className="space-y-2">
                                <Label htmlFor="content">Nội dung câu hỏi *</Label>
                                <Textarea
                                    id="content"
                                    placeholder="Nhập nội dung câu hỏi..."
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="min-h-[100px]"
                                    required
                                />
                            </div>

                            {/* Quiz Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="quiz">Quiz *</Label>
                                <Select
                                    value={formData.quizId.toString()}
                                    onValueChange={(value) => setFormData({ ...formData, quizId: parseInt(value) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn quiz" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {quizzes.map((quiz) => (
                                            <SelectItem key={quiz.id} value={quiz.id.toString()}>
                                                {quiz.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Type and Difficulty */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Loại câu hỏi *</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MULTIPLE_CHOICE">Trắc nghiệm</SelectItem>
                                            <SelectItem value="TRUE_FALSE">Đúng/Sai</SelectItem>
                                            <SelectItem value="ESSAY">Tự luận</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="difficulty">Độ khó *</Label>
                                    <Select
                                        value={formData.difficulty}
                                        onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EASY">Dễ</SelectItem>
                                            <SelectItem value="MEDIUM">Trung bình</SelectItem>
                                            <SelectItem value="HARD">Khó</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="points">Điểm *</Label>
                                    <Input
                                        id="points"
                                        type="number"
                                        min="1"
                                        value={formData.points}
                                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="tags"
                                        placeholder="Nhập tag..."
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault()
                                                handleAddTag()
                                            }
                                        }}
                                    />
                                    <Button type="button" onClick={handleAddTag} variant="outline">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                {formData.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(tag)}
                                                    className="hover:text-purple-900"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Answers */}
                            {(formData.type === "MULTIPLE_CHOICE" || formData.type === "TRUE_FALSE") && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Đáp án *</Label>
                                        {formData.type === "MULTIPLE_CHOICE" && (
                                            <Button type="button" onClick={handleAddAnswer} variant="outline" size="sm">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Thêm đáp án
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        {answers.map((answer, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                                                <input
                                                    type="checkbox"
                                                    checked={answer.isCorrect}
                                                    onChange={(e) => handleAnswerChange(index, "isCorrect", e.target.checked)}
                                                    className="w-4 h-4 text-[#6B59CE] focus:ring-[#6B59CE] rounded"
                                                />
                                                <Input
                                                    placeholder={`Đáp án ${index + 1}`}
                                                    value={answer.content}
                                                    onChange={(e) => handleAnswerChange(index, "content", e.target.value)}
                                                    className="flex-1"
                                                />
                                                {formData.type === "MULTIPLE_CHOICE" && answers.length > 2 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveAnswer(index)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Submit Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-6 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/library")}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-[#6B59CE] hover:bg-[#5a4ab8]"
                                >
                                    {isLoading ? "Đang cập nhật..." : "Cập nhật câu hỏi"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
