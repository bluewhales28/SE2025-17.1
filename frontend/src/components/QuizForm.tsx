"use client"

import { useState, useEffect } from "react"
import { Plus, X, Trash2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import { useQuizStore } from "@/store/useQuizStore"
import { questionService } from "@/services/question.service"
import { toast } from "sonner"

interface QuizFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    quizId?: number
    onSuccess?: () => void
}

interface QuestionData {
    id?: number
    content: string
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY'
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    points: number
    answers: {
        id?: number
        content: string
        isCorrect: boolean
    }[]
}

export default function QuizForm({ open, onOpenChange, quizId, onSuccess }: QuizFormProps) {
    const isEdit = !!quizId
    const { createQuiz, updateQuiz, getQuizById, isLoading } = useQuizStore()

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        timeLimit: 30,
        totalPoints: 100,
        difficulty: "EASY" as "EASY" | "MEDIUM" | "HARD",
        tags: [] as string[],
        topic: "",
    })

    const [questions, setQuestions] = useState<QuestionData[]>([])
    const [tagInput, setTagInput] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            if (isEdit && quizId) {
                loadQuiz()
            } else {
                resetForm()
            }
        }
    }, [open, isEdit, quizId])

    const loadQuiz = async () => {
        if (!quizId) return

        setLoading(true)
        try {
            const quiz = await getQuizById(quizId)

            if (!quiz) {
                toast.error("Không tìm thấy quiz")
                onOpenChange(false)
                return
            }

            setFormData({
                title: quiz.title,
                description: quiz.description || "",
                timeLimit: quiz.timeLimit,
                totalPoints: quiz.totalPoints,
                difficulty: quiz.difficulty,
                tags: quiz.tags || [],
                topic: quiz.topic || "",
            })

            // Load questions của quiz này
            try {
                const allQuestions = await questionService.getQuestions()
                const quizQuestions = allQuestions.filter(q => q.quizId === quizId)

                // Convert questions từ API sang format của form
                const formattedQuestions = quizQuestions.map(q => ({
                    id: q.id,
                    content: q.content,
                    type: q.type,
                    difficulty: q.difficulty,
                    points: q.points,
                    answers: q.answers || []
                }))

                setQuestions(formattedQuestions)
            } catch (err) {
                console.error("Failed to load questions:", err)
                // Không show error, chỉ log thôi
            }
        } catch (err: any) {
            toast.error(err.message || "Không thể tải quiz")
            onOpenChange(false)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            timeLimit: 30,
            totalPoints: 100,
            difficulty: "EASY",
            tags: [],
            topic: "",
        })
        setQuestions([])
        setTagInput("")
    }

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                content: "",
                type: "MULTIPLE_CHOICE",
                difficulty: "EASY",
                points: 10,
                answers: [
                    { content: "", isCorrect: false },
                    { content: "", isCorrect: false }
                ]
            }
        ])
    }

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index))
    }

    const updateQuestion = (index: number, field: keyof QuestionData, value: any) => {
        const newQuestions = [...questions]
        newQuestions[index] = { ...newQuestions[index], [field]: value }
        setQuestions(newQuestions)
    }

    const addAnswer = (questionIndex: number) => {
        const newQuestions = [...questions]
        newQuestions[questionIndex].answers.push({ content: "", isCorrect: false })
        setQuestions(newQuestions)
    }

    const removeAnswer = (questionIndex: number, answerIndex: number) => {
        const newQuestions = [...questions]
        newQuestions[questionIndex].answers = newQuestions[questionIndex].answers.filter((_, i) => i !== answerIndex)
        setQuestions(newQuestions)
    }

    const updateAnswer = (questionIndex: number, answerIndex: number, field: 'content' | 'isCorrect', value: any) => {
        const newQuestions = [...questions]
        newQuestions[questionIndex].answers[answerIndex] = {
            ...newQuestions[questionIndex].answers[answerIndex],
            [field]: value
        }
        setQuestions(newQuestions)
    }

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
            setTagInput("")
        }
    }

    const handleRemoveTag = (tag: string) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title.trim()) {
            toast.error("Vui lòng nhập tiêu đề quiz")
            return
        }

        // Validate questions if any
        if (questions.length > 0) {
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i]
                if (!q.content.trim()) {
                    toast.error(`Câu hỏi ${i + 1}: Vui lòng nhập nội dung`)
                    return
                }
                if (q.type === 'MULTIPLE_CHOICE' && q.answers.length < 2) {
                    toast.error(`Câu hỏi ${i + 1}: Cần ít nhất 2 đáp án`)
                    return
                }
                const hasCorrectAnswer = q.answers.some(a => a.isCorrect)
                if (!hasCorrectAnswer) {
                    toast.error(`Câu hỏi ${i + 1}: Cần có ít nhất 1 đáp án đúng`)
                    return
                }
            }
        }

        try {
            const payload = {
                ...formData,
                isPublic: true,
                maxAttempts: 3,
            }

            let createdQuizId: number | undefined

            if (isEdit && quizId) {
                await updateQuiz(quizId, payload)
                createdQuizId = quizId
                toast.success("Cập nhật quiz thành công!")
            } else {
                const result = await createQuiz(payload)
                createdQuizId = result?.id
                toast.success("Tạo quiz thành công!")
            }

            // Create/Update questions if any and we have quizId
            if (questions.length > 0 && createdQuizId) {
                let successCount = 0
                for (const question of questions) {
                    try {
                        if (isEdit && question.id) {
                            // Update existing question
                            await questionService.updateQuestion(question.id, {
                                content: question.content,
                                type: question.type,
                                difficulty: question.difficulty,
                                points: question.points,
                                tags: formData.tags,
                                quizId: createdQuizId,
                                answers: question.answers
                            })
                        } else {
                            // Create new question
                            await questionService.createQuestion({
                                content: question.content,
                                type: question.type,
                                difficulty: question.difficulty,
                                points: question.points,
                                tags: formData.tags,
                                quizId: createdQuizId,
                                answers: question.answers
                            })
                        }
                        successCount++
                    } catch (err: any) {
                        console.error("Failed to create/update question:", err)
                    }
                }
                if (successCount > 0) {
                    toast.success(`Đã ${isEdit ? 'cập nhật' : 'tạo'} ${successCount}/${questions.length} câu hỏi`)
                }
            }

            onOpenChange(false)
            onSuccess?.()
        } catch (err: any) {
            toast.error(err.message || `${isEdit ? 'Cập nhật' : 'Tạo'} quiz thất bại`)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        {loading ? "Đang tải..." : isEdit ? "Chỉnh sửa quiz" : "Tạo quiz mới"}
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B59CE]"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Tiêu đề *</Label>
                            <Input
                                id="title"
                                placeholder="Nhập tiêu đề quiz..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea
                                id="description"
                                placeholder="Nhập mô tả quiz..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="min-h-[80px]"
                            />
                        </div>

                        {/* Topic */}
                        <div className="space-y-2">
                            <Label htmlFor="topic">Chủ đề</Label>
                            <Input
                                id="topic"
                                placeholder="Ví dụ: JavaScript, Python..."
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                            />
                        </div>

                        {/* Time, Points, Difficulty */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="timeLimit">Thời gian (phút) *</Label>
                                <Input
                                    id="timeLimit"
                                    type="number"
                                    min="1"
                                    value={formData.timeLimit}
                                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="totalPoints">Tổng điểm *</Label>
                                <Input
                                    id="totalPoints"
                                    type="number"
                                    min="1"
                                    value={formData.totalPoints}
                                    onChange={(e) => setFormData({ ...formData, totalPoints: parseInt(e.target.value) })}
                                    required
                                />
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

                        {/* Questions Section */}
                        <div className="space-y-4 pt-6 border-t">
                            <div className="flex items-center justify-between">
                                <Label className="text-lg font-semibold">Câu hỏi (Tùy chọn)</Label>
                                <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                                    <Plus className="w-4 h-4 mr-1" />
                                    Thêm câu hỏi
                                </Button>
                            </div>

                            {questions.map((question, qIndex) => (
                                <div key={qIndex} className="p-4 border rounded-lg space-y-4 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-medium">Câu hỏi {qIndex + 1}</Label>
                                        <Button
                                            type="button"
                                            onClick={() => removeQuestion(qIndex)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Nội dung *</Label>
                                        <Textarea
                                            placeholder="Nhập nội dung câu hỏi..."
                                            value={question.content}
                                            onChange={(e) => updateQuestion(qIndex, 'content', e.target.value)}
                                            className="min-h-[60px]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Loại câu hỏi *</Label>
                                            <Select
                                                value={question.type}
                                                onValueChange={(value) => updateQuestion(qIndex, 'type', value)}
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
                                            <Label>Độ khó *</Label>
                                            <Select
                                                value={question.difficulty}
                                                onValueChange={(value) => updateQuestion(qIndex, 'difficulty', value)}
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
                                            <Label>Điểm *</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={question.points}
                                                onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    {/* Answers */}
                                    {question.type !== 'ESSAY' && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label>Đáp án *</Label>
                                                <Button
                                                    type="button"
                                                    onClick={() => addAnswer(qIndex)}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Plus className="w-4 h-4 mr-1" />
                                                    Thêm đáp án
                                                </Button>
                                            </div>

                                            <div className="space-y-2">
                                                {question.answers.map((answer, aIndex) => (
                                                    <div key={aIndex} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={answer.isCorrect}
                                                            onChange={(e) => updateAnswer(qIndex, aIndex, 'isCorrect', e.target.checked)}
                                                            className="w-4 h-4"
                                                        />
                                                        <Input
                                                            placeholder={`Đáp án ${aIndex + 1}...`}
                                                            value={answer.content}
                                                            onChange={(e) => updateAnswer(qIndex, aIndex, 'content', e.target.value)}
                                                        />
                                                        <Button
                                                            type="button"
                                                            onClick={() => removeAnswer(qIndex, aIndex)}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600"
                                                        >
                                                            <X className="w-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-[#6B59CE] hover:bg-[#5a4ab8]"
                            >
                                {isLoading ? "Đang xử lý..." : isEdit ? "Cập nhật" : "Tạo mới"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
