"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Plus, Bell, Menu, Settings, LogOut, Moon, Sun, Home, Pencil, Trash2, FileQuestion, Users, BookOpen } from "lucide-react"
import { Sidebar } from "@/components/common/Sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/store/useAuthStore"
import { useQuizStore } from "@/store/useQuizStore"
import { useQuestionStore } from "@/store/useQuestionStore"
import { useClassStore } from "@/store/useClassStore"
import QuizForm from "@/components/QuizForm"
import QuestionForm from "@/components/QuestionForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

export default function LibraryPage() {
    const router = useRouter()
    const { user, logout, initializeUser } = useAuthStore()
    const { quizzes, isLoading, error, fetchQuizzes, deleteQuiz, getQuizById } = useQuizStore()
    const { questions, isLoading: questionsLoading, fetchQuestions, deleteQuestion } = useQuestionStore()
    const { classes, isLoading: classesLoading, fetchClasses } = useClassStore()
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState("classes")
    const [darkMode, setDarkMode] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [quizFormOpen, setQuizFormOpen] = useState(false)
    const [questionFormOpen, setQuestionFormOpen] = useState(false)
    const [questionsSheetOpen, setQuestionsSheetOpen] = useState(false)
    const [selectedQuizId, setSelectedQuizId] = useState<number | undefined>(undefined)
    const [selectedQuestionId, setSelectedQuestionId] = useState<number | undefined>(undefined)
    const [currentQuiz, setCurrentQuiz] = useState<any>(null)
    const [questionSearchQuery, setQuestionSearchQuery] = useState("")

    useEffect(() => {
        initializeUser()
    }, [initializeUser])

    useEffect(() => {
        fetchQuizzes()
        fetchClasses()
    }, [fetchQuizzes, fetchClasses])

    useEffect(() => {
        if (error) {
            toast.error(error)
        }
    }, [error])

    const handleLogout = async () => {
        try {
            await logout()
            toast.success("Đăng xuất thành công!")
        } catch (err: any) {
            toast.error(err.message || "Đăng xuất thất bại")
        }
    }

    const handleDelete = async (id: number) => {
        if (confirm("Bạn có chắc chắn muốn xóa quiz này? Tất cả câu hỏi trong quiz cũng sẽ bị xóa.")) {
            try {
                await deleteQuiz(id)
                toast.success("Xóa quiz thành công!")
            } catch (err: any) {
                toast.error(err.message || "Xóa quiz thất bại")
            }
        }
    }

    const handleOpenCreateQuiz = () => {
        setSelectedQuizId(undefined)
        setQuizFormOpen(true)
    }

    const handleOpenEditQuiz = (id: number) => {
        setSelectedQuizId(id)
        setQuizFormOpen(true)
    }

    const handleQuizFormSuccess = () => {
        fetchQuizzes()
    }

    const handleManageQuestions = async (quizId: number) => {
        const quiz = await getQuizById(quizId)
        setCurrentQuiz(quiz)
        setSelectedQuizId(quizId)
        setQuestionsSheetOpen(true)
        fetchQuestions()
    }

    const handleOpenCreateQuestion = () => {
        setSelectedQuestionId(undefined)
        setQuestionFormOpen(true)
    }

    const handleOpenEditQuestion = (id: number) => {
        setSelectedQuestionId(id)
        setQuestionFormOpen(true)
    }

    const handleDeleteQuestion = async (id: number) => {
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

    const handleQuestionFormSuccess = () => {
        fetchQuestions()
    }

    const toggleDarkMode = () => {
        setDarkMode(!darkMode)
        toast.success(darkMode ? "Chế độ sáng" : "Chế độ tối")
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

    const quizQuestions = selectedQuizId ? questions.filter(q => q.quizId === selectedQuizId) : []

    const filteredQuestions = quizQuestions.filter(q =>
        questionSearchQuery === '' || q.content.toLowerCase().includes(questionSearchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left Section */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="hover:bg-gray-100"
                            >
                                <Menu className="h-6 w-6" />
                            </Button>
                            <Link href="/" className="flex items-center">
                                <div className="text-2xl font-bold text-[#6B59CE]">
                                    <span className="bg-[#6B59CE] text-white px-2 py-1 rounded">Q</span>
                                </div>
                            </Link>
                        </div>

                        {/* Center Section - Search */}
                        <div className="flex-1 max-w-3xl mx-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder={activeTab === "classes" ? "Tìm kiếm lớp học..." : "Tìm kiếm quiz..."}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-gray-50 border-gray-200 focus-visible:ring-[#6B59CE] text-base"
                                />
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                                <Plus className="h-6 w-6" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Bell className="h-6 w-6" />
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="h-10 w-10 cursor-pointer">
                                        <AvatarImage src="/images/avatar.jpg" alt="User" />
                                        <AvatarFallback className="bg-[#6B59CE] text-white">
                                            {user?.email?.[0].toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer">
                                        <Settings className="mr-2 h-5 w-5" />
                                        <span>Cài đặt</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={toggleDarkMode} className="cursor-pointer">
                                        {darkMode ? <Sun className="mr-2 h-5 w-5" /> : <Moon className="mr-2 h-5 w-5" />}
                                        <span>{darkMode ? "Chế độ sáng" : "Chế độ tối"}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                                        <LogOut className="mr-2 h-5 w-5" />
                                        <span>Đăng xuất</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r overflow-y-auto transition-transform duration-300 ease-in-out z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar />
            </aside>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden top-16"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold">Thư viện của bạn</h1>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                            <TabsTrigger value="classes" className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Lớp học của bạn
                            </TabsTrigger>
                            <TabsTrigger value="quizzes" className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Quiz của bạn
                            </TabsTrigger>
                        </TabsList>

                        {/* Classes Tab */}
                        <TabsContent value="classes">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Danh sách Lớp học của bạn</CardTitle>
                                        <Button className="bg-[#6B59CE] hover:bg-[#5a4ab8]" onClick={() => router.push("/classes/create")}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Tạo lớp học mới
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {classesLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B59CE]"></div>
                                        </div>
                                    ) : classes.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                            <p className="text-lg mb-2">Chưa có lớp học nào</p>
                                            <Button className="bg-[#6B59CE] hover:bg-[#5a4ab8]" onClick={() => router.push("/classes/create")}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Tạo lớp học đầu tiên
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {classes
                                                .filter(c => searchQuery === '' || c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                                .map((classItem) => (
                                                    <Card key={classItem.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/classes/${classItem.id}`)}>
                                                        <CardHeader>
                                                            <div className="flex items-start justify-between">
                                                                <CardTitle className="text-lg">{classItem.name}</CardTitle>
                                                                <Badge variant={classItem.status === "ACTIVE" ? "default" : "secondary"}>
                                                                    {classItem.status}
                                                                </Badge>
                                                            </div>
                                                            {classItem.subject && (
                                                                <Badge variant="outline" className="mt-2">
                                                                    {classItem.subject}
                                                                </Badge>
                                                            )}
                                                        </CardHeader>
                                                        <CardContent>
                                                            {classItem.description && (
                                                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{classItem.description}</p>
                                                            )}
                                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                                <div className="flex items-center gap-4">
                                                                    <span className="flex items-center gap-1">
                                                                        <Users className="w-4 h-4" />
                                                                        {classItem.memberCount}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <BookOpen className="w-4 h-4" />
                                                                        {classItem.assignmentCount}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Quizzes Tab */}
                        <TabsContent value="quizzes">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Danh sách Quiz của bạn</CardTitle>
                                        <Button className="bg-[#6B59CE] hover:bg-[#5a4ab8]" onClick={handleOpenCreateQuiz}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Thêm Quiz
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B59CE]"></div>
                                        </div>
                                    ) : quizzes.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                            <p className="text-lg mb-2">Chưa có quiz nào</p>
                                            <Button className="bg-[#6B59CE] hover:bg-[#5a4ab8]" onClick={handleOpenCreateQuiz}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Tạo quiz đầu tiên
                                            </Button>
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[50px]">ID</TableHead>
                                                    <TableHead>Tiêu đề</TableHead>
                                                    <TableHead className="w-[120px]">Chủ đề</TableHead>
                                                    <TableHead className="w-[100px]">Độ khó</TableHead>
                                                    <TableHead className="w-20">Điểm</TableHead>
                                                    <TableHead className="w-20">Thời gian</TableHead>
                                                    <TableHead className="w-[200px] text-right">Hành động</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {quizzes
                                                    .filter(q => searchQuery === '' || q.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                                    .map((quiz) => (
                                                        <TableRow key={quiz.id}>
                                                            <TableCell className="font-medium">{quiz.id}</TableCell>
                                                            <TableCell className="max-w-md">
                                                                <div>
                                                                    <div className="font-medium">{quiz.title}</div>
                                                                    {quiz.description && (
                                                                        <div className="text-sm text-gray-500 truncate">{quiz.description}</div>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {quiz.topic && (
                                                                    <Badge variant="secondary">{quiz.topic}</Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={getDifficultyColor(quiz.difficulty)}>
                                                                    {quiz.difficulty}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>{quiz.totalPoints}</TableCell>
                                                            <TableCell>{quiz.timeLimit}m</TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleManageQuestions(quiz.id)}
                                                                        className="text-[#6B59CE] hover:text-[#5a4ab8]"
                                                                    >
                                                                        <FileQuestion className="h-4 w-4 mr-1" />
                                                                        Câu hỏi
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditQuiz(quiz.id)}>
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(quiz.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
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
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            {/* Quiz Form Dialog */}
            <QuizForm
                open={quizFormOpen}
                onOpenChange={setQuizFormOpen}
                quizId={selectedQuizId}
                onSuccess={handleQuizFormSuccess}
            />

            {/* Questions Sheet */}
            <Sheet open={questionsSheetOpen} onOpenChange={setQuestionsSheetOpen}>
                <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl">Quản lý Câu hỏi</SheetTitle>
                        {currentQuiz && (
                            <div className="mt-2 space-y-2">
                                <h3 className="text-lg font-semibold">{currentQuiz.title}</h3>
                                {currentQuiz.description && (
                                    <p className="text-sm text-gray-600">{currentQuiz.description}</p>
                                )}
                                <div className="flex gap-2 flex-wrap">
                                    <Badge className={getDifficultyColor(currentQuiz.difficulty)}>
                                        {currentQuiz.difficulty}
                                    </Badge>
                                    {currentQuiz.topic && (
                                        <Badge variant="secondary">{currentQuiz.topic}</Badge>
                                    )}
                                </div>
                            </div>
                        )}
                    </SheetHeader>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Tìm kiếm câu hỏi..."
                                    value={questionSearchQuery}
                                    onChange={(e) => setQuestionSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button onClick={handleOpenCreateQuestion} className="bg-[#6B59CE] hover:bg-[#5a4ab8]">
                                <Plus className="w-4 h-4 mr-1" />
                                Thêm
                            </Button>
                        </div>

                        {questionsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B59CE]"></div>
                            </div>
                        ) : filteredQuestions.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                {quizQuestions.length === 0 ? "Chưa có câu hỏi nào" : "Không tìm thấy câu hỏi"}
                            </div>
                        ) : (
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[60px]">STT</TableHead>
                                            <TableHead>Nội dung</TableHead>
                                            <TableHead className="w-[120px]">Loại</TableHead>
                                            <TableHead className="w-[100px]">Độ khó</TableHead>
                                            <TableHead className="w-[80px]">Điểm</TableHead>
                                            <TableHead className="w-[120px] text-right">Hành động</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredQuestions.map((question, index) => (
                                            <TableRow key={question.id}>
                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                <TableCell className="max-w-md">
                                                    <div className="line-clamp-2">{question.content}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{getTypeLabel(question.type)}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getDifficultyColor(question.difficulty)}>
                                                        {question.difficulty}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{question.points}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditQuestion(question.id)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteQuestion(question.id)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Question Form Dialog */}
            <QuestionForm
                open={questionFormOpen}
                onOpenChange={setQuestionFormOpen}
                questionId={selectedQuestionId}
                onSuccess={handleQuestionFormSuccess}
            />
        </div>
    )
}
