"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Menu, Home, BookOpen, Users, Bell, Copy, RefreshCw, Plus, Edit, Trash2, UserPlus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/store/useAuthStore"
import { useClassStore } from "@/store/useClassStore"
import { toast } from "sonner"

export default function ClassDetailPage() {
    const router = useRouter()
    const params = useParams()
    const classId = Number(params.id)
    const { user, initializeUser } = useAuthStore()
    const { currentClass, isLoading, error, fetchClassById, deleteClass, regenerateInvitationCode } = useClassStore()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    useEffect(() => {
        initializeUser()
    }, [initializeUser])

    useEffect(() => {
        if (classId) {
            fetchClassById(classId)
        }
    }, [classId, fetchClassById])

    useEffect(() => {
        if (error) {
            toast.error(error)
        }
    }, [error])

    const handleDelete = async () => {
        if (confirm("Bạn có chắc chắn muốn xóa lớp học này? Tất cả dữ liệu liên quan sẽ bị xóa.")) {
            try {
                await deleteClass(classId)
                toast.success("Xóa lớp học thành công!")
                router.push("/classes")
            } catch (err: any) {
                toast.error(err.message || "Xóa lớp học thất bại")
            }
        }
    }

    const handleRegenerateCode = async () => {
        try {
            await regenerateInvitationCode(classId)
            toast.success("Tạo lại mã mời thành công!")
        } catch (err: any) {
            toast.error(err.message || "Tạo lại mã mời thất bại")
        }
    }

    const copyInvitationCode = async () => {
        if (currentClass?.invitationCode) {
            try {
                await navigator.clipboard.writeText(currentClass.invitationCode)
                toast.success("Đã sao chép mã mời!")
            } catch (err) {
                // Fallback for older browsers
                const textArea = document.createElement("textarea")
                textArea.value = currentClass.invitationCode
                textArea.style.position = "fixed"
                textArea.style.opacity = "0"
                document.body.appendChild(textArea)
                textArea.select()
                try {
                    document.execCommand('copy')
                    toast.success("Đã sao chép mã mời!")
                } catch (e) {
                    toast.error("Không thể sao chép mã mời")
                }
                document.body.removeChild(textArea)
            }
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B59CE]"></div>
            </div>
        )
    }

    if (!currentClass) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card>
                    <CardContent className="py-12">
                        <p className="text-center text-gray-600">Không tìm thấy lớp học</p>
                        <Button onClick={() => router.push("/classes")} className="mt-4">
                            Quay lại danh sách
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
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
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/classes")}
                        className="mb-6"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại danh sách
                    </Button>

                    {/* Class Header */}
                    <Card className="mb-6">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <CardTitle className="text-3xl">{currentClass.name}</CardTitle>
                                        <Badge variant={currentClass.status === "ACTIVE" ? "default" : "secondary"}>
                                            {currentClass.status}
                                        </Badge>
                                    </div>
                                    {currentClass.subject && (
                                        <Badge variant="outline" className="mb-2">
                                            {currentClass.subject}
                                        </Badge>
                                    )}
                                    {currentClass.description && (
                                        <CardDescription className="mt-2 text-base">
                                            {currentClass.description}
                                        </CardDescription>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push(`/classes/${classId}/edit`)}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Chỉnh sửa
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleDelete}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Xóa
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">Thành viên</p>
                                        <p className="text-lg font-semibold">{currentClass.memberCount}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <BookOpen className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">Bài tập</p>
                                        <p className="text-lg font-semibold">{currentClass.assignmentCount}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <UserPlus className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">Mã mời</p>
                                        <div className="flex items-center gap-2">
                                            <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                                {currentClass.invitationCode}
                                            </code>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={copyInvitationCode}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={handleRegenerateCode}
                                            >
                                                <RefreshCw className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Mời học sinh</CardTitle>
                                <CardDescription>
                                    Chia sẻ mã mời hoặc link để học sinh tham gia lớp
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex gap-2">
                                    <Input
                                        value={currentClass.invitationCode}
                                        readOnly
                                        className="font-mono"
                                    />
                                    <Button onClick={copyInvitationCode}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Quản lý</CardTitle>
                                <CardDescription>
                                    Quản lý thành viên và bài tập của lớp
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    onClick={() => router.push(`/classes/${classId}/members`)}
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    Quản lý thành viên
                                </Button>
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    onClick={() => router.push(`/classes/${classId}/assignments`)}
                                >
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Quản lý bài tập
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Placeholder for future content */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin lớp học</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Ngày tạo:</span>
                                    <span>{new Date(currentClass.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Cập nhật lần cuối:</span>
                                    <span>{new Date(currentClass.updatedAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}

