"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Pencil, Trash2, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useQuizStore } from "@/store/useQuizStore"
import { useQuestionStore } from "@/store/useQuestionStore"
import QuestionForm from "@/components/QuestionForm"
import { toast } from "sonner"

export default function QuizQuestionsPage() {
    const router = useRouter()
    const params = useParams()
    const quizId = parseInt(params.id as string)

    const { getQuizById } = useQuizStore()
    const { questions, isLoading, fetchQuestions, deleteQuestion } = useQuestionStore()

    const [quiz, setQuiz] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [formOpen, setFormOpen] = useState(false)
    const [selectedQuestionId, setSelectedQuestionId] = useState<number | undefined>(undefined)

    useEffect(() => {
        loadQuiz()
        fetchQuestions()
    }, [quizId])

    const loadQuiz = async () => {
        try {
            const data = await getQuizById(quizId)
            setQuiz(data)
        } catch (err: any) {
            toast.error("Không thể tải quiz")
            router.push("/library")
        }
    }

    const handleOpenCreate = () => {
        setSelectedQuestionId(undefined)
        setFormOpen(true)
    }

    const handleOpenEdit = (id: number) => {
        setSelectedQuestionId(id)
        setFormOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
            try {
                await deleteQuestion(id)
                toast.success("Xóa câu hỏi thành công!")
                fetchQuestions()
            } catch (err: any) {
                toast.error(err.message || "Xóa câu hỏi thất bại")
            }
        }
    }

    const handleFormSuccess = () => {
        fetchQuestions()
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

    // Filter questions by current quiz
    const quizQuestions = questions.filter(q => q.quizId === quizId)

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link href="/library" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại thư viện
                    </Link>
                </div>

                {quiz && (
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
                        {quiz.description && (
                            <p className="text-gray-600">{quiz.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3">
                            <Badge className={getDifficultyColor(quiz.difficulty)}>
                                {quiz.difficulty}
                            </Badge>
                            {quiz.topic && (
                                <Badge variant="secondary">{quiz.topic}</Badge>
                            )}
                            <span className="text-sm text-gray-600">{quiz.timeLimit} phút</span>
                            <span className="text-sm text-gray-600">{quiz.totalPoints} điểm</span>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mb-6">
                    <div className="flex-1 max-w-md">
                        <Input
                            type="text"
                            placeholder="Tìm kiếm câu hỏi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <Button className="bg-[#6B59CE] hover:bg-[#5a4ab8]" onClick={handleOpenCreate}>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm câu hỏi
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Danh sách câu hỏi ({quizQuestions.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B59CE]"></div>
                            </div>
                        ) : quizQuestions.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">STT</TableHead>
                                        <TableHead>Nội dung</TableHead>
                                        <TableHead className="w-[120px]">Loại</TableHead>
                                        <TableHead className="w-[100px]">Độ khó</TableHead>
                                        <TableHead className="w-20">Điểm</TableHead>
                                        <TableHead className="w-[150px] text-right">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {quizQuestions
                                        .filter(q => searchQuery === '' || q.content.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .map((question, index) => (
                                            <TableRow key={question.id}>
                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                <TableCell className="max-w-md truncate">{question.content}</TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-gray-600">{getTypeLabel(question.type)}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getDifficultyColor(question.difficulty)}>
                                                        {question.difficulty}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{question.points}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => router.push(`/question/${question.id}`)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(question.id)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(question.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Question Form Dialog */}
            <QuestionForm
                open={formOpen}
                onOpenChange={setFormOpen}
                questionId={selectedQuestionId}
                onSuccess={handleFormSuccess}
            />
        </div>
    )
}
