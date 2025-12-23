"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Menu, Home, BookOpen, Users, Bell, Plus, Trash2, Edit } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import { useAuthStore } from "@/store/useAuthStore"
import { useClassStore } from "@/store/useClassStore"
import { useQuizStore } from "@/store/useQuizStore"
import { assignmentService, AssignmentResponse, CreateAssignmentRequest } from "@/services/assignment.service"
import { toast } from "sonner"

export default function ClassAssignmentsPage() {
    const router = useRouter()
    const params = useParams()
    const classId = Number(params.id)
    const { user, initializeUser } = useAuthStore()
    const { currentClass, fetchClassById } = useClassStore()
    const { quizzes, fetchQuizzes, error: quizError, isLoading: isLoadingQuizzes } = useQuizStore()
    const [assignments, setAssignments] = useState<AssignmentResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [statusFilter, setStatusFilter] = useState<"all" | "not_done" | "done">("all")
    const isTeacher = currentClass?.userRole === "TEACHER"
    const [formData, setFormData] = useState<CreateAssignmentRequest>({
        classId: classId,
        quizId: 0,
        title: "",
        description: "",
        openTime: "",
        deadline: "",
        allowRetake: false,
        maxAttempts: 1,
    })

    useEffect(() => {
        initializeUser()
    }, [initializeUser])

    useEffect(() => {
        if (classId) {
            fetchClassById(classId)
            loadAssignments()
            fetchQuizzes().catch(() => {
                // Silently handle error - don't show toast
                // Error will be available in quizError state
            })
        }
    }, [classId, fetchClassById, fetchQuizzes])

    const loadAssignments = async () => {
        setIsLoading(true)
        try {
            const response = await assignmentService.getAssignmentsByClass(classId)
            setAssignments(response.data || [])
        } catch (err: any) {
            toast.error(err.message || "Không thể tải danh sách bài tập")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateAssignment = async () => {
        if (!formData.quizId || !formData.title || !formData.openTime || !formData.deadline) {
            toast.error("Vui lòng điền đầy đủ thông tin")
            return
        }

        try {
            // Convert datetime-local format to ISO 8601
            const openTimeISO = new Date(formData.openTime).toISOString()
            const deadlineISO = new Date(formData.deadline).toISOString()
            
            const assignmentData: CreateAssignmentRequest = {
                ...formData,
                openTime: openTimeISO,
                deadline: deadlineISO,
            }
            
            await assignmentService.createAssignment(assignmentData)
            toast.success("Tạo bài tập thành công!")
            setCreateDialogOpen(false)
            setFormData({
                classId: classId,
                quizId: 0,
                title: "",
                description: "",
                openTime: "",
                deadline: "",
                allowRetake: false,
                maxAttempts: 1,
            })
            loadAssignments()
        } catch (err: any) {
            toast.error(err.message || "Tạo bài tập thất bại")
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden"
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#6B59CE] rounded flex items-center justify-center">
                            <span className="text-white font-bold text-lg">Q</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r overflow-y-auto transition-transform duration-300 ease-in-out z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <nav className="px-4 py-4 space-y-2">
                    <Link href="/latest" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg text-base">
                        <Home className="w-6 h-6" />
                        Trang chủ
                    </Link>
                    <Link href="/library" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg text-base">
                        <BookOpen className="w-6 h-6" />
                        Thư viện của bạn
                    </Link>
                    <Link href="/classes" className="flex items-center gap-3 px-4 py-3 text-[#6B59CE] bg-purple-50 rounded-lg font-medium text-base">
                        <Users className="w-6 h-6" />
                        Lớp học của bạn
                    </Link>
                    <Link href="/notifications" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg text-base">
                        <Bell className="w-6 h-6" />
                        Thông báo
                    </Link>
                </nav>
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
                <div className="p-6 max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.push(`/classes/${classId}`)}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại
                        </Button>
                        {isTeacher ? (
                            <Button
                                onClick={() => setCreateDialogOpen(true)}
                                className="bg-[#6B59CE] hover:bg-[#5a4ab8]"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Giao bài tập
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    variant={statusFilter === "all" ? "default" : "outline"}
                                    onClick={() => setStatusFilter("all")}
                                >
                                    Tất cả
                                </Button>
                                <Button
                                    variant={statusFilter === "not_done" ? "default" : "outline"}
                                    onClick={() => setStatusFilter("not_done")}
                                >
                                    Chưa làm
                                </Button>
                                <Button
                                    variant={statusFilter === "done" ? "default" : "outline"}
                                    onClick={() => setStatusFilter("done")}
                                >
                                    Đã làm
                                </Button>
                            </div>
                        )}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">
                                {isTeacher ? "Quản lý bài tập" : "Bài tập"}
                            </CardTitle>
                            {currentClass && (
                                <CardDescription>Lớp: {currentClass.name}</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B59CE]"></div>
                                </div>
                            ) : assignments.length === 0 ? (
                                <div className="text-center py-12">
                                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-4">Chưa có bài tập nào</p>
                                    {isTeacher && (
                                        <Button
                                            onClick={() => setCreateDialogOpen(true)}
                                            className="bg-[#6B59CE] hover:bg-[#5a4ab8]"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Giao bài tập đầu tiên
                                        </Button>
                                    )}
                                </div>
                            ) : (() => {
                                // Filter assignments based on status for STUDENT
                                const filteredAssignments = isTeacher 
                                    ? assignments 
                                    : assignments.filter(assignment => {
                                        if (statusFilter === "all") return true
                                        if (statusFilter === "not_done") {
                                            return !assignment.userStatus || 
                                                   assignment.userStatus === "NOT_STARTED" || 
                                                   assignment.userStatus === "IN_PROGRESS" ||
                                                   assignment.userStatus === "OVERDUE"
                                        }
                                        if (statusFilter === "done") {
                                            return assignment.userStatus === "SUBMITTED"
                                        }
                                        return true
                                    })

                                if (filteredAssignments.length === 0) {
                                    return (
                                        <div className="text-center py-12">
                                            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-600">Không có bài tập nào</p>
                                        </div>
                                    )
                                }

                                return (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tiêu đề</TableHead>
                                                <TableHead>Mô tả</TableHead>
                                                <TableHead>Thời gian mở</TableHead>
                                                <TableHead>Hạn nộp</TableHead>
                                                {!isTeacher && <TableHead>Trạng thái</TableHead>}
                                                {isTeacher && <TableHead>Cho phép làm lại</TableHead>}
                                                <TableHead className="text-right">Thao tác</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredAssignments.map((assignment) => (
                                                <TableRow key={assignment.id}>
                                                    <TableCell className="font-medium">
                                                        {assignment.title}
                                                    </TableCell>
                                                    <TableCell>
                                                        {assignment.description || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(assignment.openTime).toLocaleString('vi-VN')}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(assignment.deadline).toLocaleString('vi-VN')}
                                                    </TableCell>
                                                    {!isTeacher && (
                                                        <TableCell>
                                                            <Badge variant={
                                                                assignment.userStatus === "SUBMITTED" ? "default" :
                                                                assignment.userStatus === "IN_PROGRESS" ? "secondary" :
                                                                assignment.userStatus === "OVERDUE" ? "destructive" :
                                                                "outline"
                                                            }>
                                                                {assignment.userStatus === "SUBMITTED" ? "Đã làm" :
                                                                 assignment.userStatus === "IN_PROGRESS" ? "Đang làm" :
                                                                 assignment.userStatus === "OVERDUE" ? "Quá hạn" :
                                                                 "Chưa làm"}
                                                            </Badge>
                                                        </TableCell>
                                                    )}
                                                    {isTeacher && (
                                                        <TableCell>
                                                            <Badge variant={assignment.allowRetake ? "default" : "secondary"}>
                                                                {assignment.allowRetake ? "Có" : "Không"}
                                                            </Badge>
                                                        </TableCell>
                                                    )}
                                                    <TableCell className="text-right">
                                                        {isTeacher ? (
                                                            <div className="flex justify-end gap-2">
                                                                <Button variant="ghost" size="icon">
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    // TODO: Navigate to do assignment
                                                                    toast.info("Chức năng làm bài tập đang được phát triển")
                                                                }}
                                                                disabled={assignment.userStatus === "SUBMITTED" && !assignment.allowRetake}
                                                            >
                                                                {assignment.userStatus === "SUBMITTED" ? "Xem kết quả" : "Làm bài"}
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )
                            })()}
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Create Assignment Dialog - Only for TEACHER */}
            {isTeacher && (
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Giao bài tập mới</DialogTitle>
                        <DialogDescription>
                            Tạo bài tập mới cho lớp học này
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="quiz">Chọn Quiz *</Label>
                            {isLoadingQuizzes ? (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#6B59CE]"></div>
                                    Đang tải danh sách quiz...
                                </div>
                            ) : quizError ? (
                                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                                    Không thể tải danh sách quiz. Vui lòng thử lại sau.
                                </div>
                            ) : quizzes.length === 0 ? (
                                <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded">
                                    Chưa có quiz nào. Vui lòng tạo quiz trước khi giao bài tập.
                                </div>
                            ) : (
                                <Select
                                    value={formData.quizId > 0 ? formData.quizId.toString() : ""}
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
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="title">Tiêu đề *</Label>
                            <Input
                                id="title"
                                placeholder="Nhập tiêu đề bài tập"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea
                                id="description"
                                placeholder="Nhập mô tả bài tập"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="openTime">Thời gian mở *</Label>
                            <Input
                                id="openTime"
                                type="datetime-local"
                                value={formData.openTime}
                                onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="deadline">Hạn nộp *</Label>
                            <Input
                                id="deadline"
                                type="datetime-local"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="allowRetake">Cho phép làm lại</Label>
                            <Select
                                value={formData.allowRetake ? "true" : "false"}
                                onValueChange={(value) => setFormData({ ...formData, allowRetake: value === "true" })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Có</SelectItem>
                                    <SelectItem value="false">Không</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {formData.allowRetake && (
                            <div className="grid gap-2">
                                <Label htmlFor="maxAttempts">Số lần làm tối đa</Label>
                                <Input
                                    id="maxAttempts"
                                    type="number"
                                    min="1"
                                    value={formData.maxAttempts}
                                    onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) || 1 })}
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCreateDialogOpen(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleCreateAssignment}
                            className="bg-[#6B59CE] hover:bg-[#5a4ab8]"
                            disabled={quizzes.length === 0 || isLoadingQuizzes || !!quizError}
                        >
                            Tạo bài tập
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            )}
        </div>
    )
}

